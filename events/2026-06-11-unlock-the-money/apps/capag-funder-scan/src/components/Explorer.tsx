"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Input,
  NativeSelect,
  Table,
  Text,
} from "@chakra-ui/react";
import CityPanel from "./CityPanel";
import { HAZARDS, HAZARD_BY_KEY } from "../lib/display";

export type Row = {
  ibge: string;
  name: string;
  uf: string;
  capag: string;
  debt: string;
  savings: string;
  liquidity: string;
  icf: string;
  locode: string;
  risks: Record<string, number> | null;
};

const TIERS = ["A+", "A", "B+", "B", "C", "D", "n.d.", "n.e."] as const;

const TIER_TOKEN: Record<string, string> = {
  "A+": "rating.aplus",
  A: "rating.a",
  "B+": "rating.bplus",
  B: "rating.b",
  C: "rating.c",
  D: "rating.d",
  "n.d.": "rating.nd",
  "n.e.": "rating.ne",
};

const TIER_LABELS: Record<string, string> = {
  "A+": "bankable, top accounting",
  A: "bankable",
  "B+": "credit-eligible",
  B: "credit-eligible",
  C: "no federal credit → blended finance",
  D: "bottom tier",
  "n.d.": "not rated (bad data) → TA market",
  "n.e.": "not evaluated",
};

const HIGH_RISK = 0.5;

function TierBadge({ tier }: { tier: string }) {
  return (
    <Badge
      bg={TIER_TOKEN[tier] ?? "border.neutral"}
      color={tier === "n.e." ? "content.secondary" : "base.light"}
      fontWeight="700"
      minW="26px"
      justifyContent="center"
    >
      {tier}
    </Badge>
  );
}

function topHazard(risks: Record<string, number> | null, within?: Set<string>) {
  if (!risks) return null;
  let best: { hazard: string; score: number } | null = null;
  for (const [hazard, score] of Object.entries(risks)) {
    if (within && within.size > 0 && !within.has(hazard)) continue;
    if (!best || score > best.score) best = { hazard, score };
  }
  return best;
}

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function Explorer({ rows }: { rows: Row[] }) {
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [hazards, setHazards] = useState<Set<string>>(new Set());
  const [uf, setUf] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);

  const hasRisks = useMemo(() => rows.some((r) => r.risks), [rows]);
  const ufs = useMemo(() => Array.from(new Set(rows.map((r) => r.uf))).sort(), [rows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.capag] = (c[r.capag] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        (tiers.size === 0 || tiers.has(r.capag)) &&
        (!uf || r.uf === uf) &&
        (!needle || r.name.toLowerCase().includes(needle)) &&
        (hazards.size === 0 ||
          Array.from(hazards).some((h) => (r.risks?.[h] ?? 0) >= HIGH_RISK))
    );
    if (hazards.size > 0) {
      out.sort(
        (a, b) =>
          (topHazard(b.risks, hazards)?.score ?? 0) -
          (topHazard(a.risks, hazards)?.score ?? 0)
      );
    }
    return out;
  }, [rows, tiers, uf, q, hazards]);

  const shown = filtered.slice(0, 300);

  return (
    <>
      {/* CC-style top bar */}
      <Box bg="content.alternative" color="base.light" py="3">
        <Container maxW="6xl">
          <Flex align="baseline" gap="3">
            <Heading size="md" fontFamily="heading" color="base.light">
              CAPAG Funder Scan
            </Heading>
            <Text fontSize="xs" color="background.overlay">
              Tesouro Nacional CAPAG (Nov 2025) × CityCatalyst climate data
            </Text>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" py="8">
        <Text color="content.tertiary" fontSize="sm" mb="6">
          {rows.length.toLocaleString()} Brazilian municipalities. Indicative screening signal,
          not a credit decision. Select multiple ratings and climate risks to segment the market.
        </Text>

        {/* tier multiselect */}
        <Text fontSize="xs" fontWeight="700" color="content.secondary" textTransform="uppercase" letterSpacing="wide" mb="2">
          Fiscal capacity (CAPAG)
        </Text>
        <Flex gap="2" wrap="wrap" mb="5">
          {TIERS.map((t) => {
            const active = tiers.has(t);
            return (
              <Button
                key={t}
                onClick={() => setTiers(toggle(tiers, t))}
                variant="outline"
                h="auto"
                py="2.5"
                px="3.5"
                bg={active ? "background.overlay" : "background.default"}
                borderColor={active ? "interactive.secondary" : "border.neutral"}
                borderWidth={active ? "2px" : "1px"}
                display="block"
                textAlign="left"
                minW="130px"
              >
                <Flex align="center" gap="2">
                  <TierBadge tier={t} />
                  <Text fontWeight="700" fontFamily="heading">
                    {(counts[t] ?? 0).toLocaleString()}
                  </Text>
                </Flex>
                <Text fontSize="xs" color="content.tertiary" mt="1" fontWeight="400">
                  {TIER_LABELS[t]}
                </Text>
              </Button>
            );
          })}
        </Flex>

        {/* risk multiselect */}
        {hasRisks && (
          <>
            <Text fontSize="xs" fontWeight="700" color="content.secondary" textTransform="uppercase" letterSpacing="wide" mb="2">
              High climate risk (CCRA ≥ 50, any selected)
            </Text>
            <Flex gap="2" wrap="wrap" mb="6">
              {HAZARDS.map((h) => {
                const active = hazards.has(h.key);
                return (
                  <Button
                    key={h.key}
                    onClick={() => setHazards(toggle(hazards, h.key))}
                    variant="outline"
                    size="sm"
                    borderRadius="full"
                    bg={active ? "content.link" : "background.default"}
                    color={active ? "base.light" : "content.secondary"}
                    borderColor={active ? "content.link" : "border.neutral"}
                  >
                    <Icon as={h.icon} boxSize="4" />
                    {h.label}
                  </Button>
                );
              })}
            </Flex>
          </>
        )}

        <Flex gap="3" mb="3">
          <Input
            placeholder="Search municipality…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            bg="background.default"
            flex="1"
          />
          <NativeSelect.Root w="180px" bg="background.default">
            <NativeSelect.Field value={uf} onChange={(e) => setUf(e.target.value)}>
              <option value="">All states</option>
              {ufs.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>

        <Text fontSize="sm" color="content.tertiary" mb="2">
          {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
          {filtered.length > shown.length ? ` — showing first ${shown.length}` : ""}
          {hazards.size > 0 ? " · sorted by selected risk" : ""}
        </Text>

        <Box bg="background.default" borderRadius="lg" borderWidth="1px" borderColor="border.neutral" overflow="hidden">
          <Table.Root size="sm" striped>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Municipality</Table.ColumnHeader>
                <Table.ColumnHeader>UF</Table.ColumnHeader>
                <Table.ColumnHeader>CAPAG</Table.ColumnHeader>
                <Table.ColumnHeader title="Indicator 1 — consolidated debt / net current revenue">
                  Debt
                </Table.ColumnHeader>
                <Table.ColumnHeader title="Indicator 2 — current expenses vs revenues (3yr)">
                  Savings
                </Table.ColumnHeader>
                <Table.ColumnHeader title="Indicator 3 — cash vs short-term obligations">
                  Liquidity
                </Table.ColumnHeader>
                <Table.ColumnHeader title="Siconfi accounting-quality ranking">ICF</Table.ColumnHeader>
                {hasRisks && (
                  <Table.ColumnHeader title="Highest CCRA hazard score (normalized 0-100)">
                    Top climate risk
                  </Table.ColumnHeader>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {shown.map((r) => {
                const top = topHazard(r.risks, hazards);
                const meta = top ? HAZARD_BY_KEY[top.hazard] : null;
                return (
                  <Table.Row
                    key={r.ibge}
                    onClick={() => setSelected(r)}
                    cursor="pointer"
                    _hover={{ bg: "background.neutral" }}
                  >
                    <Table.Cell fontWeight="500" color="content.link">
                      {r.name}
                    </Table.Cell>
                    <Table.Cell color="content.tertiary">{r.uf}</Table.Cell>
                    <Table.Cell>
                      <TierBadge tier={r.capag} />
                    </Table.Cell>
                    <Table.Cell>{r.debt}</Table.Cell>
                    <Table.Cell>{r.savings}</Table.Cell>
                    <Table.Cell>{r.liquidity}</Table.Cell>
                    <Table.Cell color="content.tertiary">{r.icf}</Table.Cell>
                    {hasRisks && (
                      <Table.Cell>
                        {top && meta ? (
                          <Flex
                            align="center"
                            gap="1"
                            fontSize="xs"
                            color={top.score >= HIGH_RISK ? "rating.d" : "content.tertiary"}
                          >
                            <Icon as={meta.icon} boxSize="3.5" />
                            {meta.label} {(top.score * 100).toFixed(0)}
                          </Flex>
                        ) : (
                          <Text fontSize="xs" color="content.tertiary">
                            —
                          </Text>
                        )}
                      </Table.Cell>
                    )}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>
        {selected && <CityPanel row={selected} onClose={() => setSelected(null)} />}
      </Container>
    </>
  );
}
