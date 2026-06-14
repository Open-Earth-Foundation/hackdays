from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pypdf import PdfReader

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "political_will.sqlite"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-3.5-flash")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_LLM_SOURCE_CHARS = 16000

SIGNAL_LABELS: dict[str, str] = {
    "budgetFollowThrough": "Budget follow-through",
    "electionExposure": "Election exposure",
    "institutionalContinuity": "Institutional continuity",
    "publicCommitment": "Public commitment",
}
SIGNAL_WEIGHTS: dict[str, float] = {
    "budgetFollowThrough": 0.35,
    "electionExposure": 0.25,
    "institutionalContinuity": 0.25,
    "publicCommitment": 0.15,
}
ALLOWED_SIGNAL_KEYS = set(SIGNAL_LABELS)
ALLOWED_UPLOAD_SUFFIXES = {".pdf", ".txt", ".csv", ".json"}


class SourceCreate(BaseModel):
    sourceKind: Literal["url", "manual_note"] = "url"
    sourceType: str = "other"
    title: str | None = None
    url: str | None = None
    rawText: str | None = None
    contractStatus: str | None = None
    submittedBy: str = "Demo reviewer"


class NewsSearchRequest(BaseModel):
    recencyDays: int = Field(default=30, ge=1, le=365)
    queryTerms: str | None = None
    submittedBy: str = "Demo reviewer"


app = FastAPI(title="Political Will Score API", version="0.1.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def make_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def content_hash(content: bytes | str) -> str:
    if isinstance(content, str):
        content = content.encode("utf-8")
    return hashlib.sha256(content).hexdigest()


def excerpt(text: str | None, limit: int = 600) -> str | None:
    if not text:
        return None
    normalized = re.sub(r"\s+", " ", text).strip()
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[:limit].rstrip()}..."


def clamp_int(value: Any, minimum: int, maximum: int, default: int = 0) -> int:
    try:
        parsed = int(round(float(value)))
    except (TypeError, ValueError):
        parsed = default
    return max(minimum, min(maximum, parsed))


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS cities (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                action_confidence INTEGER NOT NULL,
                source_backed_actions INTEGER NOT NULL,
                evidence_gaps INTEGER NOT NULL,
                pending_review INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY,
                city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
                rank INTEGER NOT NULL,
                title TEXT NOT NULL,
                sector TEXT NOT NULL,
                sector_icon TEXT NOT NULL,
                source_name TEXT NOT NULL,
                source_url TEXT NOT NULL,
                source_checked_date TEXT NOT NULL,
                selected INTEGER NOT NULL DEFAULT 1,
                score INTEGER NOT NULL,
                confidence TEXT NOT NULL,
                evidence_complete INTEGER NOT NULL,
                evidence_expected INTEGER NOT NULL,
                pending_review INTEGER NOT NULL,
                top_data_gap TEXT,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS political_will_action_score (
                action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
                signal_key TEXT NOT NULL,
                score INTEGER NOT NULL,
                status TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (action_id, signal_key)
            );

            CREATE TABLE IF NOT EXISTS political_will_sources (
                id TEXT PRIMARY KEY,
                city_id TEXT NOT NULL,
                action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
                source_kind TEXT NOT NULL,
                source_type TEXT NOT NULL,
                title TEXT,
                url TEXT,
                file_name TEXT,
                file_mime_type TEXT,
                file_size_bytes INTEGER,
                storage_path TEXT,
                content_sha256 TEXT,
                raw_text TEXT,
                extracted_text TEXT,
                excerpt TEXT,
                contract_status TEXT,
                date_checked TEXT NOT NULL,
                submitted_by TEXT NOT NULL,
                review_status TEXT NOT NULL,
                status_code INTEGER,
                metadata_json TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS political_will_evidence (
                id TEXT PRIMARY KEY,
                city_id TEXT NOT NULL,
                action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
                source_id TEXT REFERENCES political_will_sources(id) ON DELETE SET NULL,
                type TEXT NOT NULL,
                source_name TEXT NOT NULL,
                source_url TEXT,
                signal_key TEXT NOT NULL,
                status TEXT NOT NULL,
                impact TEXT NOT NULL,
                impact_value INTEGER,
                evidence_date TEXT,
                extracted_claim TEXT,
                source_excerpt TEXT,
                contract_status TEXT,
                added_by TEXT,
                confidence TEXT,
                reviewer_decision TEXT,
                reviewer_note TEXT,
                created_at TEXT NOT NULL,
                reviewed_at TEXT
            );

            CREATE TABLE IF NOT EXISTS political_will_audit_events (
                id TEXT PRIMARY KEY,
                action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
                actor_name TEXT NOT NULL,
                event_type TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS political_will_news_findings (
                id TEXT PRIMARY KEY,
                city_id TEXT NOT NULL,
                action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
                query TEXT NOT NULL,
                recency_window_days INTEGER NOT NULL,
                title TEXT,
                url TEXT,
                excerpt TEXT,
                source_id TEXT REFERENCES political_will_sources(id) ON DELETE SET NULL,
                evidence_id TEXT REFERENCES political_will_evidence(id) ON DELETE SET NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        if conn.execute("SELECT COUNT(*) FROM cities").fetchone()[0] == 0:
            seed_demo_data(conn)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def add_audit(conn: sqlite3.Connection, action_id: str, actor: str, event_type: str, message: str) -> None:
    conn.execute(
        """
        INSERT INTO political_will_audit_events (id, action_id, actor_name, event_type, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (make_id("audit"), action_id, actor, event_type, message, utc_now()),
    )


def insert_source(
    conn: sqlite3.Connection,
    *,
    city_id: str,
    action_id: str,
    source_kind: str,
    source_type: str,
    title: str | None,
    url: str | None = None,
    file_name: str | None = None,
    file_mime_type: str | None = None,
    file_size_bytes: int | None = None,
    storage_path: str | None = None,
    content_sha256: str | None = None,
    raw_text: str | None = None,
    extracted_text: str | None = None,
    contract_status: str | None = None,
    submitted_by: str = "Demo reviewer",
    review_status: str = "unreviewed",
    status_code: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> str:
    source_id = make_id("src")
    now = utc_now()
    conn.execute(
        """
        INSERT INTO political_will_sources (
            id, city_id, action_id, source_kind, source_type, title, url, file_name,
            file_mime_type, file_size_bytes, storage_path, content_sha256, raw_text,
            extracted_text, excerpt, contract_status, date_checked, submitted_by,
            review_status, status_code, metadata_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            source_id,
            city_id,
            action_id,
            source_kind,
            source_type,
            title,
            url,
            file_name,
            file_mime_type,
            file_size_bytes,
            storage_path,
            content_sha256,
            raw_text,
            extracted_text,
            excerpt(extracted_text or raw_text),
            contract_status,
            now[:10],
            submitted_by,
            review_status,
            status_code,
            json.dumps(metadata or {}, ensure_ascii=False),
            now,
            now,
        ),
    )
    return source_id


def insert_evidence(
    conn: sqlite3.Connection,
    *,
    city_id: str,
    action_id: str,
    source_id: str | None,
    evidence_id: str | None = None,
    evidence_type: str,
    source_name: str,
    source_url: str | None,
    signal_key: str,
    status: str,
    impact_value: int | None,
    evidence_date: str | None,
    extracted_claim: str | None,
    source_excerpt: str | None,
    contract_status: str | None,
    added_by: str | None,
    confidence: str | None,
) -> str:
    evidence_id = evidence_id or make_id("ev")
    impact = "neutral"
    if impact_value is not None and impact_value > 0:
        impact = "positive"
    elif impact_value is not None and impact_value < 0:
        impact = "negative"
    conn.execute(
        """
        INSERT INTO political_will_evidence (
            id, city_id, action_id, source_id, type, source_name, source_url, signal_key,
            status, impact, impact_value, evidence_date, extracted_claim, source_excerpt,
            contract_status, added_by, confidence, reviewer_decision, reviewer_note,
            created_at, reviewed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            evidence_id,
            city_id,
            action_id,
            source_id,
            evidence_type,
            source_name,
            source_url,
            signal_key,
            status,
            impact,
            impact_value,
            evidence_date,
            extracted_claim,
            source_excerpt,
            contract_status,
            added_by,
            confidence,
            None,
            None,
            utc_now(),
            None,
        ),
    )
    return evidence_id


def seed_demo_data(conn: sqlite3.Connection) -> None:
    now = utc_now()
    conn.execute(
        """
        INSERT INTO cities (id, name, action_confidence, source_backed_actions, evidence_gaps, pending_review)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        ("warsaw", "Warsaw", 68, 3, 4, 6),
    )
    conn.execute(
        """
        INSERT INTO cities (id, name, action_confidence, source_backed_actions, evidence_gaps, pending_review)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        ("krakow", "Krakow", 48, 1, 3, 0),
    )

    actions = [
        (
            "waw-transport-priority",
            1,
            "Establish traffic privileges for public transport vehicles.",
            "Transport",
            "\U0001f68c",
            "Sustainable Development of Warsaw",
            "https://bip.warszawa.pl/",
            "11 Jun 2026",
            74,
            "medium",
            4,
            4,
            3,
            None,
        ),
        (
            "waw-building-retrofit",
            2,
            "Comprehensive green retrofits of public buildings.",
            "Buildings",
            "\U0001f3e2",
            "Warsaw climate plan annex",
            "https://bip.warszawa.pl/",
            "10 Jun 2026",
            62,
            "medium",
            3,
            4,
            2,
            "Budget follow-through",
        ),
        (
            "waw-park-ride",
            3,
            "Develop Park & Ride and Bike & Ride systems.",
            "Mobility",
            "\U0001f6b2",
            "Warsaw transport strategy",
            "https://bip.warszawa.pl/",
            "9 Jun 2026",
            51,
            "low",
            2,
            4,
            1,
            "Institutional continuity",
        ),
    ]
    for action in actions:
        conn.execute(
            """
            INSERT INTO actions (
                id, city_id, rank, title, sector, sector_icon, source_name, source_url,
                source_checked_date, selected, score, confidence, evidence_complete,
                evidence_expected, pending_review, top_data_gap, updated_at
            )
            VALUES (?, 'warsaw', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
            """,
            (*action, now),
        )

    conn.execute(
        """
        INSERT INTO actions (
            id, city_id, rank, title, sector, sector_icon, source_name, source_url,
            source_checked_date, selected, score, confidence, evidence_complete,
            evidence_expected, pending_review, top_data_gap, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "krk-public-transport-priority",
            "krakow",
            1,
            "Prioritize public transport corridors and clean mobility delivery.",
            "Transport",
            "\U0001f68c",
            "Krakow public transport strategy",
            "https://www.krakow.pl/",
            "12 Jun 2026",
            48,
            "low",
            1,
            4,
            0,
            "Election exposure",
            now,
        ),
    )

    signal_rows = {
        "waw-transport-priority": [
            ("budgetFollowThrough", 75, "verified"),
            ("electionExposure", 55, "needs_review"),
            ("institutionalContinuity", 70, "verified"),
            ("publicCommitment", 70, "missing"),
        ],
        "waw-building-retrofit": [
            ("budgetFollowThrough", 50, "needs_review"),
            ("electionExposure", 65, "verified"),
            ("institutionalContinuity", 70, "verified"),
            ("publicCommitment", 60, "verified"),
        ],
        "waw-park-ride": [
            ("budgetFollowThrough", 40, "missing"),
            ("electionExposure", 55, "needs_review"),
            ("institutionalContinuity", 45, "missing"),
            ("publicCommitment", 60, "verified"),
        ],
        "krk-public-transport-priority": [
            ("budgetFollowThrough", 50, "needs_review"),
            ("electionExposure", 20, "missing"),
            ("institutionalContinuity", 45, "missing"),
            ("publicCommitment", 55, "missing"),
        ],
    }
    for action_id, signals in signal_rows.items():
        for signal_key, score, status in signals:
            conn.execute(
                """
                INSERT INTO political_will_action_score (action_id, signal_key, score, status, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (action_id, signal_key, score, status, now),
            )

    source_specs = [
        (
            "waw-transport-priority",
            "contract_register",
            "City contract register",
            "https://bip.warszawa.pl/",
            "started",
        ),
        (
            "waw-transport-priority",
            "news",
            "Warsaw transport news",
            "https://example.com/news",
            None,
        ),
        (
            "waw-transport-priority",
            "bip_page",
            "Transport department page",
            "https://bip.warszawa.pl/",
            None,
        ),
    ]
    source_ids: dict[str, str] = {}
    for action_id, source_type, title, url, contract_status in source_specs:
        source_ids[title] = insert_source(
            conn,
            city_id="warsaw",
            action_id=action_id,
            source_kind="url",
            source_type=source_type,
            title=title,
            url=url,
            raw_text=f"Demo source-backed text for {title}.",
            extracted_text=f"Demo source-backed text for {title}.",
            contract_status=contract_status,
            submitted_by="A. Morgan",
            review_status="approved",
        )

    seed_evidence = [
        (
            "ev-1",
            "waw-transport-priority",
            source_ids["City contract register"],
            "started_contract",
            "City contract register",
            "https://bip.warszawa.pl/",
            "budgetFollowThrough",
            "verified",
            18,
            "10 Jun 2026",
            "Started contract evidence approved",
            "The contract register shows started public transport priority works.",
            "started",
            "A. Morgan",
            "high",
        ),
        (
            "ev-2",
            "waw-transport-priority",
            source_ids["Warsaw transport news"],
            "news_article",
            "Warsaw transport news",
            "https://example.com/news",
            "electionExposure",
            "verified",
            -8,
            "9 Jun 2026",
            "Election timing may delay procurement phase",
            "Local reporting describes procurement risks around election timing.",
            None,
            "A. Morgan",
            "medium",
        ),
        (
            "ev-3",
            "waw-transport-priority",
            source_ids["Transport department page"],
            "department_owner",
            "Transport department page",
            "https://bip.warszawa.pl/",
            "institutionalContinuity",
            "verified",
            12,
            "8 Jun 2026",
            "Transport department owner is listed for the action",
            "The department page names an accountable transport owner.",
            None,
            "K. Nowak",
            "medium",
        ),
    ]
    for ev in seed_evidence:
        insert_evidence(
            conn,
            city_id="warsaw",
            action_id=ev[1],
            source_id=ev[2],
            evidence_id=ev[0],
            evidence_type=ev[3],
            source_name=ev[4],
            source_url=ev[5],
            signal_key=ev[6],
            status=ev[7],
            impact_value=ev[8],
            evidence_date=ev[9],
            extracted_claim=ev[10],
            source_excerpt=ev[11],
            contract_status=ev[12],
            added_by=ev[13],
            confidence=ev[14],
        )

    suggestions = [
        (
            "sug-1",
            "waw-transport-priority",
            "Started contract covers public transport priority works",
            "budgetFollowThrough",
            18,
            "high",
            "started",
        ),
        (
            "sug-2",
            "waw-transport-priority",
            "Mayor statement supports bus lane expansion",
            "publicCommitment",
            8,
            "medium",
            None,
        ),
        (
            "sug-3",
            "waw-transport-priority",
            "Election timing may delay procurement phase",
            "electionExposure",
            -6,
            "low",
            None,
        ),
        (
            "sug-4",
            "waw-building-retrofit",
            "Retrofit budget line requires confirmation",
            "budgetFollowThrough",
            6,
            "medium",
            "planned",
        ),
        (
            "sug-5",
            "waw-building-retrofit",
            "Procurement owner continuity appears stable",
            "institutionalContinuity",
            5,
            "medium",
            None,
        ),
        (
            "sug-6",
            "waw-park-ride",
            "Institutional owner for Park & Ride is unclear",
            "institutionalContinuity",
            -7,
            "low",
            None,
        ),
    ]
    for evidence_id, action_id, claim, signal_key, impact_value, confidence, contract_status in suggestions:
        source_id = insert_source(
            conn,
            city_id="warsaw",
            action_id=action_id,
            source_kind="manual_note",
            source_type="manual_note",
            title="Seeded AI suggestion source",
            raw_text=claim,
            extracted_text=claim,
            contract_status=contract_status,
            submitted_by="Seed data",
            review_status="analyzed",
        )
        insert_evidence(
            conn,
            city_id="warsaw",
            action_id=action_id,
            source_id=source_id,
            evidence_id=evidence_id,
            evidence_type="ai_suggestion",
            source_name="Seeded AI suggestion source",
            source_url=None,
            signal_key=signal_key,
            status="suggested",
            impact_value=impact_value,
            evidence_date=now[:10],
            extracted_claim=claim,
            source_excerpt=claim,
            contract_status=contract_status,
            added_by="AI",
            confidence=confidence,
        )

    add_audit(conn, "waw-transport-priority", "A. Morgan", "score_recalculated", "Political will: 74 / 100")
    add_audit(conn, "waw-transport-priority", "K. Nowak", "evidence_verified", "Started contract evidence approved")
    add_audit(conn, "waw-transport-priority", "A. Morgan", "source_added", "City contract register URL added")


def row_to_source(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "cityId": row["city_id"],
        "actionId": row["action_id"],
        "sourceKind": row["source_kind"],
        "sourceType": row["source_type"],
        "title": row["title"],
        "url": row["url"],
        "fileName": row["file_name"],
        "fileMimeType": row["file_mime_type"],
        "fileSizeBytes": row["file_size_bytes"],
        "storagePath": row["storage_path"],
        "contentSha256": row["content_sha256"],
        "excerpt": row["excerpt"],
        "contractStatus": row["contract_status"],
        "dateChecked": row["date_checked"],
        "submittedBy": row["submitted_by"],
        "reviewStatus": row["review_status"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def row_to_evidence(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "actionId": row["action_id"],
        "sourceId": row["source_id"],
        "type": row["type"],
        "sourceName": row["source_name"],
        "sourceUrl": row["source_url"],
        "signalKey": row["signal_key"],
        "status": row["status"],
        "impact": row["impact"],
        "impactValue": row["impact_value"],
        "evidenceDate": row["evidence_date"],
        "extractedClaim": row["extracted_claim"],
        "sourceExcerpt": row["source_excerpt"],
        "contractStatus": row["contract_status"],
        "addedBy": row["added_by"],
        "confidence": row["confidence"],
        "reviewerDecision": row["reviewer_decision"],
        "reviewerNote": row["reviewer_note"],
        "createdAt": row["created_at"],
        "reviewedAt": row["reviewed_at"],
    }


def row_to_signal(row: sqlite3.Row, evidence_ids: list[str]) -> dict[str, Any]:
    return {
        "key": row["signal_key"],
        "label": SIGNAL_LABELS[row["signal_key"]],
        "weight": SIGNAL_WEIGHTS[row["signal_key"]],
        "score": row["score"],
        "status": row["status"],
        "evidenceIds": evidence_ids,
    }


def build_action(conn: sqlite3.Connection, row: sqlite3.Row) -> dict[str, Any]:
    evidence_rows = conn.execute(
        """
        SELECT * FROM political_will_evidence
        WHERE action_id = ?
        ORDER BY created_at
        """,
        (row["id"],),
    ).fetchall()
    audit_rows = conn.execute(
        """
        SELECT * FROM political_will_audit_events
        WHERE action_id = ?
        ORDER BY created_at DESC
        """,
        (row["id"],),
    ).fetchall()
    signal_rows = conn.execute(
        """
        SELECT * FROM political_will_action_score
        WHERE action_id = ?
        ORDER BY CASE signal_key
            WHEN 'budgetFollowThrough' THEN 1
            WHEN 'electionExposure' THEN 2
            WHEN 'institutionalContinuity' THEN 3
            WHEN 'publicCommitment' THEN 4
            ELSE 5
        END
        """,
        (row["id"],),
    ).fetchall()
    verified_by_signal: dict[str, list[str]] = {key: [] for key in SIGNAL_LABELS}
    for evidence in evidence_rows:
        if evidence["status"] == "verified":
            verified_by_signal.setdefault(evidence["signal_key"], []).append(evidence["id"])

    return {
        "id": row["id"],
        "rank": row["rank"],
        "title": row["title"],
        "sector": row["sector"],
        "sectorIcon": row["sector_icon"],
        "sourceName": row["source_name"],
        "sourceUrl": row["source_url"],
        "sourceCheckedDate": row["source_checked_date"],
        "selected": bool(row["selected"]),
        "score": row["score"],
        "confidence": row["confidence"],
        "evidenceComplete": row["evidence_complete"],
        "evidenceExpected": row["evidence_expected"],
        "pendingReview": row["pending_review"],
        "topDataGap": row["top_data_gap"],
        "signals": [row_to_signal(signal, verified_by_signal.get(signal["signal_key"], [])) for signal in signal_rows],
        "evidence": [row_to_evidence(evidence) for evidence in evidence_rows],
        "auditLog": [
            {
                "id": event["id"],
                "actionId": event["action_id"],
                "actorName": event["actor_name"],
                "eventType": event["event_type"],
                "message": event["message"],
                "createdAt": event["created_at"],
            }
            for event in audit_rows
        ],
    }


def build_suggestions(conn: sqlite3.Connection, action_id: str) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT * FROM political_will_evidence
        WHERE action_id = ? AND status IN ('suggested', 'needs_review')
        ORDER BY created_at DESC
        """,
        (action_id,),
    ).fetchall()
    return [
        {
            "id": row["id"],
            "evidenceId": row["id"],
            "claim": row["extracted_claim"] or "Untitled suggested evidence",
            "signalKey": row["signal_key"],
            "signalLabel": SIGNAL_LABELS.get(row["signal_key"], row["signal_key"]),
            "contractStatus": row["contract_status"],
            "impact": row["impact_value"] or 0,
            "confidence": row["confidence"] or "medium",
            "sourceName": row["source_name"],
            "sourceUrl": row["source_url"],
            "sourceExcerpt": row["source_excerpt"],
            "status": row["status"],
        }
        for row in rows
    ]


def build_city(conn: sqlite3.Connection, city_id: str) -> dict[str, Any]:
    city = conn.execute("SELECT * FROM cities WHERE id = ?", (city_id,)).fetchone()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    actions = conn.execute(
        "SELECT * FROM actions WHERE city_id = ? ORDER BY rank",
        (city_id,),
    ).fetchall()
    return {
        "cityId": city["id"],
        "cityName": city["name"],
        "actionConfidence": city["action_confidence"],
        "sourceBackedActions": city["source_backed_actions"],
        "evidenceGaps": city["evidence_gaps"],
        "pendingReview": city["pending_review"],
        "actions": [build_action(conn, action) for action in actions],
    }


def build_detail(conn: sqlite3.Connection, city_id: str, action_id: str) -> dict[str, Any]:
    action = conn.execute(
        "SELECT * FROM actions WHERE city_id = ? AND id = ?",
        (city_id, action_id),
    ).fetchone()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return {
        "city": build_city(conn, city_id),
        "action": build_action(conn, action),
        "suggestions": build_suggestions(conn, action_id),
    }


def confidence_label(verified_count: int, expected_count: int) -> str:
    if expected_count <= 0:
        return "low"
    ratio = verified_count / expected_count
    if ratio >= 0.8:
        return "high"
    if ratio >= 0.4:
        return "medium"
    return "low"


def refresh_city_metrics(conn: sqlite3.Connection, city_id: str) -> None:
    actions = conn.execute("SELECT * FROM actions WHERE city_id = ?", (city_id,)).fetchall()
    if not actions:
        return
    action_confidence = round(sum(action["score"] for action in actions) / len(actions))
    source_backed_actions = sum(1 for action in actions if action["source_url"])
    evidence_gaps = 0
    for action in actions:
        evidence_gaps += conn.execute(
            """
            SELECT COUNT(*) FROM political_will_action_score
            WHERE action_id = ? AND status = 'missing'
            """,
            (action["id"],),
        ).fetchone()[0]
    pending_review = sum(action["pending_review"] for action in actions)
    conn.execute(
        """
        UPDATE cities
        SET action_confidence = ?, source_backed_actions = ?, evidence_gaps = ?, pending_review = ?
        WHERE id = ?
        """,
        (action_confidence, source_backed_actions, evidence_gaps, pending_review, city_id),
    )


def refresh_action_metrics(conn: sqlite3.Connection, city_id: str, action_id: str) -> None:
    signals = conn.execute(
        "SELECT * FROM political_will_action_score WHERE action_id = ?",
        (action_id,),
    ).fetchall()
    score = round(sum(signal["score"] * SIGNAL_WEIGHTS[signal["signal_key"]] for signal in signals))
    expected = conn.execute(
        "SELECT evidence_expected FROM actions WHERE id = ?",
        (action_id,),
    ).fetchone()["evidence_expected"]
    verified = conn.execute(
        """
        SELECT COUNT(*) FROM political_will_evidence
        WHERE action_id = ? AND status = 'verified'
        """,
        (action_id,),
    ).fetchone()[0]
    pending = conn.execute(
        """
        SELECT COUNT(*) FROM political_will_evidence
        WHERE action_id = ? AND status IN ('suggested', 'needs_review')
        """,
        (action_id,),
    ).fetchone()[0]
    top_gap_row = conn.execute(
        """
        SELECT signal_key FROM political_will_action_score
        WHERE action_id = ? AND status = 'missing'
        ORDER BY CASE signal_key
            WHEN 'budgetFollowThrough' THEN 1
            WHEN 'electionExposure' THEN 2
            WHEN 'institutionalContinuity' THEN 3
            WHEN 'publicCommitment' THEN 4
            ELSE 5
        END
        LIMIT 1
        """,
        (action_id,),
    ).fetchone()
    top_gap = SIGNAL_LABELS[top_gap_row["signal_key"]] if top_gap_row else None
    evidence_complete = min(expected, verified)
    conn.execute(
        """
        UPDATE actions
        SET score = ?, confidence = ?, evidence_complete = ?, pending_review = ?,
            top_data_gap = ?, updated_at = ?
        WHERE id = ?
        """,
        (
            score,
            confidence_label(evidence_complete, expected),
            evidence_complete,
            pending,
            top_gap,
            utc_now(),
            action_id,
        ),
    )
    refresh_city_metrics(conn, city_id)


def fetch_url_text(url: str) -> dict[str, Any]:
    try:
        with httpx.Client(timeout=15, follow_redirects=True) as client:
            response = client.get(url, headers={"User-Agent": "PoliticalWillScore/0.1"})
        text = response.text
        soup = BeautifulSoup(text, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        title = soup.title.string.strip() if soup.title and soup.title.string else url
        body = soup.get_text(" ")
        return {
            "title": title,
            "text": re.sub(r"\s+", " ", body).strip(),
            "status_code": response.status_code,
            "error": None,
        }
    except Exception as exc:  # noqa: BLE001 - source fetch failures are recorded as source metadata.
        return {"title": url, "text": "", "status_code": None, "error": str(exc)}


def extract_upload_text(filename: str, content: bytes) -> tuple[str, dict[str, Any]]:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Accepted types: .pdf, .txt, .csv, .json",
        )
    if suffix == ".pdf":
        reader = PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages).strip(), {"extraction_method": "pypdf", "page_count": len(pages)}
    decoded = content.decode("utf-8", errors="replace")
    if suffix == ".csv":
        rows = list(csv.DictReader(io.StringIO(decoded)))
        columns = list(rows[0].keys()) if rows else []
        lines = [", ".join(f"{key}: {value}" for key, value in row.items()) for row in rows[:80]]
        return "\n".join(lines), {
            "extraction_method": "csv.DictReader",
            "row_count": len(rows),
            "columns": columns,
        }
    if suffix == ".json":
        try:
            parsed = json.loads(decoded)
        except json.JSONDecodeError:
            parsed = decoded
        return json.dumps(parsed, ensure_ascii=False, indent=2)[:MAX_LLM_SOURCE_CHARS], {
            "extraction_method": "json.loads",
        }
    return decoded, {"extraction_method": "utf-8 text"}


def source_name_for_row(row: sqlite3.Row) -> str:
    return row["title"] or row["file_name"] or row["url"] or "Submitted source"


def require_openrouter_key() -> str:
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY is not configured; analysis and web search are unavailable.",
        )
    return key


def extract_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?", "", stripped).strip()
        stripped = re.sub(r"```$", "", stripped).strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


async def openrouter_json(messages: list[dict[str, str]], *, use_web: bool = False) -> tuple[dict[str, Any], dict[str, Any]]:
    key = require_openrouter_key()
    body: dict[str, Any] = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
    }
    if use_web:
        body["plugins"] = [{"id": "web", "max_results": 5}]
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://127.0.0.1:3000"),
        "X-Title": "Political Will Score",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, headers=headers, json=body)
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"OpenRouter request failed: {response.text[:500]}")
    payload = response.json()
    message = payload["choices"][0]["message"]
    return extract_json_object(message.get("content") or "{}"), message


def normalize_suggestions(payload: dict[str, Any]) -> list[dict[str, Any]]:
    raw_suggestions = payload.get("suggestions") or payload.get("evidence") or []
    suggestions: list[dict[str, Any]] = []
    for item in raw_suggestions:
        if not isinstance(item, dict):
            continue
        signal_key = item.get("signalKey") or item.get("signal_key")
        if signal_key not in ALLOWED_SIGNAL_KEYS:
            label = str(item.get("signalLabel") or item.get("signal_label") or "").lower()
            signal_key = next((key for key, value in SIGNAL_LABELS.items() if value.lower() == label), None)
        if signal_key not in ALLOWED_SIGNAL_KEYS:
            continue
        claim = str(item.get("claim") or item.get("extractedClaim") or item.get("summary") or "").strip()
        if not claim:
            continue
        confidence = str(item.get("confidence") or "medium").lower()
        if confidence not in {"low", "medium", "high"}:
            confidence = "medium"
        suggestions.append(
            {
                "claim": claim,
                "signal_key": signal_key,
                "evidence_type": str(item.get("suggestedEvidenceType") or item.get("type") or "ai_suggestion"),
                "impact": clamp_int(item.get("impact") or item.get("suggestedScoreDelta"), -40, 40, 0),
                "confidence": confidence,
                "contract_status": item.get("contractStatus") or item.get("contract_status"),
                "source_excerpt": excerpt(str(item.get("sourceExcerpt") or item.get("excerpt") or claim), 700),
                "title": item.get("title"),
                "url": item.get("url") or item.get("sourceUrl"),
            }
        )
    return suggestions


def source_analysis_prompt(action: sqlite3.Row, source: sqlite3.Row, source_text: str) -> list[dict[str, str]]:
    content = source_text[:MAX_LLM_SOURCE_CHARS]
    return [
        {
            "role": "system",
            "content": (
                "You analyze municipal political will evidence. Return JSON only. "
                "Create suggested evidence records, never verified evidence. "
                "Use only the provided source text. Valid signalKey values are "
                "budgetFollowThrough, electionExposure, institutionalContinuity, publicCommitment."
            ),
        },
        {
            "role": "user",
            "content": json.dumps(
                {
                    "task": "Extract reviewable political will evidence from this source.",
                    "actionTitle": action["title"],
                    "cityId": action["city_id"],
                    "sourceContract": {
                        "sourceKind": source["source_kind"],
                        "sourceType": source["source_type"],
                        "title": source["title"],
                        "url": source["url"],
                        "contractStatus": source["contract_status"],
                    },
                    "requiredJsonShape": {
                        "suggestions": [
                            {
                                "claim": "specific claim grounded in source text",
                                "signalKey": "budgetFollowThrough | electionExposure | institutionalContinuity | publicCommitment",
                                "suggestedEvidenceType": "contract | news_article | public_statement | manual_note | other",
                                "impact": "integer between -40 and 40",
                                "confidence": "low | medium | high",
                                "contractStatus": "optional planned/current/started/completed/cancelled",
                                "sourceExcerpt": "short exact-or-close excerpt from source text",
                            }
                        ]
                    },
                    "sourceText": content,
                },
                ensure_ascii=False,
            ),
        },
    ]


def news_search_prompt(city_name: str, action: sqlite3.Row, request: NewsSearchRequest) -> list[dict[str, str]]:
    query_terms = request.queryTerms or (
        "elections political support opposition current public statements bias budget procurement local news"
    )
    return [
        {
            "role": "system",
            "content": (
                "Use web search to find recent local or official sources relevant to municipal political will. "
                "Return JSON only with reviewable suggested evidence. Do not invent URLs."
            ),
        },
        {
            "role": "user",
            "content": json.dumps(
                {
                    "task": "Search for political climate, elections, bias, support, opposition, budget follow-through, and local news evidence.",
                    "city": city_name,
                    "actionTitle": action["title"],
                    "recencyDays": request.recencyDays,
                    "queryTerms": query_terms,
                    "requiredJsonShape": {
                        "suggestions": [
                            {
                                "title": "source title",
                                "url": "source URL",
                                "claim": "specific claim relevant to political will",
                                "signalKey": "budgetFollowThrough | electionExposure | institutionalContinuity | publicCommitment",
                                "impact": "integer between -40 and 40",
                                "confidence": "low | medium | high",
                                "sourceExcerpt": "short source excerpt or citation summary",
                            }
                        ]
                    },
                },
                ensure_ascii=False,
            ),
        },
    ]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": OPENROUTER_MODEL}


@app.get("/api/v1/cities/{city_id}/hiap")
def get_city_hiap(city_id: str) -> dict[str, Any]:
    init_db()
    with get_conn() as conn:
        return build_city(conn, city_id)


@app.get("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will")
def get_political_will_detail(city_id: str, action_id: str) -> dict[str, Any]:
    init_db()
    with get_conn() as conn:
        return build_detail(conn, city_id, action_id)


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/sources")
def create_source(city_id: str, action_id: str, payload: SourceCreate) -> dict[str, Any]:
    init_db()
    with get_conn() as conn:
        action = conn.execute(
            "SELECT * FROM actions WHERE city_id = ? AND id = ?",
            (city_id, action_id),
        ).fetchone()
        if not action:
            raise HTTPException(status_code=404, detail="Action not found")
        if payload.sourceKind == "url":
            if not payload.url:
                raise HTTPException(status_code=400, detail="URL source requires url")
            fetched = fetch_url_text(payload.url)
            text = fetched["text"]
            source_id = insert_source(
                conn,
                city_id=city_id,
                action_id=action_id,
                source_kind="url",
                source_type=payload.sourceType,
                title=payload.title or fetched["title"],
                url=payload.url,
                raw_text=text,
                extracted_text=text,
                content_sha256=content_hash(text),
                contract_status=payload.contractStatus,
                submitted_by=payload.submittedBy,
                status_code=fetched["status_code"],
                metadata={"fetch_error": fetched["error"]},
            )
            add_audit(conn, action_id, payload.submittedBy, "source_added", f"URL source added: {payload.url}")
        else:
            if not payload.rawText:
                raise HTTPException(status_code=400, detail="Manual note source requires rawText")
            source_id = insert_source(
                conn,
                city_id=city_id,
                action_id=action_id,
                source_kind="manual_note",
                source_type=payload.sourceType,
                title=payload.title or "Manual note",
                raw_text=payload.rawText,
                extracted_text=payload.rawText,
                content_sha256=content_hash(payload.rawText),
                contract_status=payload.contractStatus,
                submitted_by=payload.submittedBy,
            )
            add_audit(conn, action_id, payload.submittedBy, "source_added", "Manual note saved as unreviewed source")
        source = conn.execute("SELECT * FROM political_will_sources WHERE id = ?", (source_id,)).fetchone()
        return {"source": row_to_source(source), "detail": build_detail(conn, city_id, action_id)}


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/sources/upload")
async def upload_source(
    city_id: str,
    action_id: str,
    sourceType: str = Form("other"),
    contractStatus: str | None = Form(None),
    submittedBy: str = Form("Demo reviewer"),
    file: UploadFile = File(...),
) -> dict[str, Any]:
    init_db()
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Uploaded file exceeds the 10 MB MVP limit")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Accepted types: .pdf, .txt, .csv, .json",
        )
    extracted_text, metadata = extract_upload_text(file.filename or "uploaded-source", content)
    source_kind = "structured_data" if suffix in {".csv", ".json"} else "uploaded_document"
    file_id = make_id("file")
    storage_name = f"{file_id}{suffix}"
    storage_path = UPLOAD_DIR / storage_name
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    storage_path.write_bytes(content)
    with get_conn() as conn:
        action = conn.execute(
            "SELECT * FROM actions WHERE city_id = ? AND id = ?",
            (city_id, action_id),
        ).fetchone()
        if not action:
            raise HTTPException(status_code=404, detail="Action not found")
        source_id = insert_source(
            conn,
            city_id=city_id,
            action_id=action_id,
            source_kind=source_kind,
            source_type=sourceType,
            title=file.filename,
            file_name=file.filename,
            file_mime_type=file.content_type,
            file_size_bytes=len(content),
            storage_path=str(storage_path.relative_to(BASE_DIR)),
            content_sha256=content_hash(content),
            raw_text=extracted_text,
            extracted_text=extracted_text,
            contract_status=contractStatus,
            submitted_by=submittedBy,
            metadata=metadata,
        )
        add_audit(conn, action_id, submittedBy, "source_added", f"Uploaded source saved: {file.filename}")
        source = conn.execute("SELECT * FROM political_will_sources WHERE id = ?", (source_id,)).fetchone()
        return {"source": row_to_source(source), "detail": build_detail(conn, city_id, action_id)}


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/sources/{source_id}/analyze")
async def analyze_source(city_id: str, action_id: str, source_id: str) -> dict[str, Any]:
    init_db()
    with get_conn() as conn:
        action = conn.execute(
            "SELECT * FROM actions WHERE city_id = ? AND id = ?",
            (city_id, action_id),
        ).fetchone()
        source = conn.execute(
            """
            SELECT * FROM political_will_sources
            WHERE city_id = ? AND action_id = ? AND id = ?
            """,
            (city_id, action_id, source_id),
        ).fetchone()
        if not action or not source:
            raise HTTPException(status_code=404, detail="Action or source not found")
        source_text = source["extracted_text"] or source["raw_text"] or source["excerpt"] or ""
        if not source_text.strip():
            raise HTTPException(status_code=400, detail="Source has no extracted text to analyze")

    payload, _message = await openrouter_json(source_analysis_prompt(action, source, source_text))
    suggestions = normalize_suggestions(payload)

    with get_conn() as conn:
        source = conn.execute("SELECT * FROM political_will_sources WHERE id = ?", (source_id,)).fetchone()
        for suggestion in suggestions:
            insert_evidence(
                conn,
                city_id=city_id,
                action_id=action_id,
                source_id=source_id,
                evidence_type=suggestion["evidence_type"],
                source_name=source_name_for_row(source),
                source_url=source["url"],
                signal_key=suggestion["signal_key"],
                status="suggested",
                impact_value=suggestion["impact"],
                evidence_date=utc_now()[:10],
                extracted_claim=suggestion["claim"],
                source_excerpt=suggestion["source_excerpt"],
                contract_status=suggestion["contract_status"] or source["contract_status"],
                added_by="AI",
                confidence=suggestion["confidence"],
            )
        conn.execute(
            """
            UPDATE political_will_sources
            SET review_status = 'analyzed', updated_at = ?
            WHERE id = ?
            """,
            (utc_now(), source_id),
        )
        add_audit(conn, action_id, "AI", "ai_suggestion_created", f"{len(suggestions)} suggested evidence records created")
        refresh_action_metrics(conn, city_id, action_id)
        return build_detail(conn, city_id, action_id)


def review_evidence(city_id: str, action_id: str, evidence_id: str, decision: str, actor: str = "Demo reviewer") -> dict[str, Any]:
    init_db()
    with get_conn() as conn:
        evidence = conn.execute(
            """
            SELECT * FROM political_will_evidence
            WHERE city_id = ? AND action_id = ? AND id = ?
            """,
            (city_id, action_id, evidence_id),
        ).fetchone()
        if not evidence:
            raise HTTPException(status_code=404, detail="Evidence not found")
        if decision == "approved":
            if evidence["status"] != "verified":
                signal = conn.execute(
                    """
                    SELECT * FROM political_will_action_score
                    WHERE action_id = ? AND signal_key = ?
                    """,
                    (action_id, evidence["signal_key"]),
                ).fetchone()
                new_signal_score = clamp_int(signal["score"] + (evidence["impact_value"] or 0), 0, 100, signal["score"])
                conn.execute(
                    """
                    UPDATE political_will_action_score
                    SET score = ?, status = 'verified', updated_at = ?
                    WHERE action_id = ? AND signal_key = ?
                    """,
                    (new_signal_score, utc_now(), action_id, evidence["signal_key"]),
                )
            conn.execute(
                """
                UPDATE political_will_evidence
                SET status = 'verified', reviewer_decision = 'approved', added_by = COALESCE(added_by, ?),
                    reviewed_at = ?
                WHERE id = ?
                """,
                (actor, utc_now(), evidence_id),
            )
            add_audit(conn, action_id, actor, "evidence_verified", evidence["extracted_claim"] or "Evidence approved")
        elif decision == "rejected":
            conn.execute(
                """
                UPDATE political_will_evidence
                SET status = 'rejected', reviewer_decision = 'rejected', reviewed_at = ?
                WHERE id = ?
                """,
                (utc_now(), evidence_id),
            )
            add_audit(conn, action_id, actor, "evidence_rejected", evidence["extracted_claim"] or "Evidence rejected")
        else:
            conn.execute(
                """
                UPDATE political_will_evidence
                SET status = 'needs_review', reviewer_decision = 'needs_review', reviewed_at = ?
                WHERE id = ?
                """,
                (utc_now(), evidence_id),
            )
            add_audit(conn, action_id, actor, "evidence_marked_needs_review", evidence["extracted_claim"] or "Evidence marked needs review")
        refresh_action_metrics(conn, city_id, action_id)
        return build_detail(conn, city_id, action_id)


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/evidence/{evidence_id}/approve")
def approve_evidence(city_id: str, action_id: str, evidence_id: str) -> dict[str, Any]:
    return review_evidence(city_id, action_id, evidence_id, "approved")


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/evidence/{evidence_id}/reject")
def reject_evidence(city_id: str, action_id: str, evidence_id: str) -> dict[str, Any]:
    return review_evidence(city_id, action_id, evidence_id, "rejected")


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/evidence/{evidence_id}/needs-review")
def needs_review_evidence(city_id: str, action_id: str, evidence_id: str) -> dict[str, Any]:
    return review_evidence(city_id, action_id, evidence_id, "needs_review")


@app.post("/api/v1/cities/{city_id}/hiap/actions/{action_id}/political-will/news-search")
async def news_search(city_id: str, action_id: str, payload: NewsSearchRequest) -> dict[str, Any]:
    init_db()
    with get_conn() as conn:
        city = conn.execute("SELECT * FROM cities WHERE id = ?", (city_id,)).fetchone()
        action = conn.execute(
            "SELECT * FROM actions WHERE city_id = ? AND id = ?",
            (city_id, action_id),
        ).fetchone()
        if not city or not action:
            raise HTTPException(status_code=404, detail="City or action not found")
        city_name = city["name"]

    response_json, _message = await openrouter_json(news_search_prompt(city_name, action, payload), use_web=True)
    suggestions = normalize_suggestions(response_json)
    query = payload.queryTerms or "elections political support opposition current public statements bias budget procurement local news"

    with get_conn() as conn:
        for suggestion in suggestions:
            source_id = insert_source(
                conn,
                city_id=city_id,
                action_id=action_id,
                source_kind="web_search_result",
                source_type="news",
                title=suggestion["title"] or "Political climate search result",
                url=suggestion["url"],
                raw_text=suggestion["source_excerpt"],
                extracted_text=suggestion["source_excerpt"],
                content_sha256=content_hash(suggestion["source_excerpt"] or suggestion["claim"]),
                submitted_by=payload.submittedBy,
                review_status="analyzed",
                metadata={"query": query, "recency_days": payload.recencyDays},
            )
            evidence_id = insert_evidence(
                conn,
                city_id=city_id,
                action_id=action_id,
                source_id=source_id,
                evidence_type="news_article",
                source_name=suggestion["title"] or "Political climate search result",
                source_url=suggestion["url"],
                signal_key=suggestion["signal_key"],
                status="suggested",
                impact_value=suggestion["impact"],
                evidence_date=utc_now()[:10],
                extracted_claim=suggestion["claim"],
                source_excerpt=suggestion["source_excerpt"],
                contract_status=suggestion["contract_status"],
                added_by="AI web search",
                confidence=suggestion["confidence"],
            )
            conn.execute(
                """
                INSERT INTO political_will_news_findings (
                    id, city_id, action_id, query, recency_window_days, title, url,
                    excerpt, source_id, evidence_id, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    make_id("finding"),
                    city_id,
                    action_id,
                    query,
                    payload.recencyDays,
                    suggestion["title"],
                    suggestion["url"],
                    suggestion["source_excerpt"],
                    source_id,
                    evidence_id,
                    utc_now(),
                ),
            )
        add_audit(conn, action_id, "AI web search", "news_search_completed", f"{len(suggestions)} political climate findings created")
        refresh_action_metrics(conn, city_id, action_id)
        return build_detail(conn, city_id, action_id)


if __name__ == "__main__":
    import uvicorn

    init_db()
    uvicorn.run("app:app", host="127.0.0.1", port=int(os.getenv("PORT", "8000")), reload=True)
