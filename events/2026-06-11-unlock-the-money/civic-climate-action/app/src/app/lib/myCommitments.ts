// Client-side record of the commitments THIS browser has made. Lets the tracker
// and receipt survive reloads without auth, and lets a move card detect that the
// resident already signed it. The server holds the aggregate + public wall; this
// holds "mine".

import type { PledgeStatus } from "./pledgeStore";

export type MyCommitment = {
  id: string;
  cityId: string;
  actionId: string;
  worryLabel: string;
  headline: string;
  channelName: string;
  channelUrl: string;
  firstName: string;
  neighborhood: string;
  createdAt: string;
  status: PledgeStatus;
};

const KEY = "civic-commitments-v1";

function read(): MyCommitment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: MyCommitment[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable / full — tracker just won't persist this session */
  }
}

export function getMyCommitments(): MyCommitment[] {
  return read();
}

// Identify a commitment by the move it belongs to (action + appetite differ by
// headline, so we key on actionId + headline).
export function findMine(actionId: string, headline: string): MyCommitment | undefined {
  return read().find((c) => c.actionId === actionId && c.headline === headline);
}

export function addMine(c: MyCommitment): void {
  const list = read().filter((x) => x.id !== c.id);
  list.push(c);
  write(list);
}

export function updateMineStatus(id: string, status: PledgeStatus): void {
  write(read().map((c) => (c.id === id ? { ...c, status } : c)));
}

const STATUS_LABEL: Record<PledgeStatus, string> = {
  committed: "Committed",
  sent: "Sent",
  responded: "Got a response",
};

export function receiptText(c: MyCommitment): string {
  const date = new Date(c.createdAt).toLocaleString();
  return [
    "CIVIC CLIMATE ACTION — COMMITMENT RECEIPT",
    "==========================================",
    "",
    `Resident:   ${c.firstName} · ${c.neighborhood}`,
    `City:       Porto Alegre`,
    `Concern:    ${c.worryLabel}`,
    "",
    `Commitment: ${c.headline}`,
    `Channel:    ${c.channelName}`,
    `            ${c.channelUrl}`,
    "",
    `Signed:     ${date}`,
    `Status:     ${STATUS_LABEL[c.status]}`,
    `Reference:  ${c.id}`,
    "",
    "This is a personal record of a civic commitment. Follow through via the",
    "channel above — your action is part of Porto Alegre's public engagement record.",
  ].join("\n");
}
