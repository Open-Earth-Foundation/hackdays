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
import dynamic from "next/dynamic";
import CityPanel from "./CityPanel";
import { HAZARDS, HAZARD_BY_KEY } from "../lib/display";

const CityMap = dynamic(() => import("./CityMap"), {
  ssr: false,
  loading: () => <Box h="420px" bg="background.neutral" borderRadius="lg" />,
});

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
  lat: number | null;
  lng: number | null;
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

function topHazards(risks: Record<string, number> | null, n: number, prefer?: Set<string>) {
  if (!risks) return [];
  return Object.entries(risks)
    .map(([hazard, score]) => ({ hazard, score, preferred: !!prefer?.has(hazard) }))
    .sort((a, b) =>
      a.preferred !== b.preferred ? (a.preferred ? -1 : 1) : b.score - a.score
    )
    .slice(0, n);
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
      const sel = (r: Row) =>
        Math.max(...Array.from(hazards).map((h) => r.risks?.[h] ?? 0));
      out.sort((a, b) => sel(b) - sel(a));
    }
    return out;
  }, [rows, tiers, uf, q, hazards]);

  const shown = filtered.slice(0, 300);
  const matchIbge = useMemo(() => new Set(filtered.map((r) => r.ibge)), [filtered]);

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
                bg={active ? "content.alternative" : "background.default"}
                borderColor={active ? "content.alternative" : "border.neutral"}
                borderWidth="2px"
                display="block"
                textAlign="left"
                minW="130px"
              >
                <Flex align="center" gap="2">
                  <TierBadge tier={t} />
                  <Text fontWeight="700" fontFamily="heading" color={active ? "base.light" : "content.primary"}>
                    {(counts[t] ?? 0).toLocaleString()}
                  </Text>
                </Flex>
                <Text fontSize="xs" color={active ? "background.overlay" : "content.tertiary"} mt="1" fontWeight="400">
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
                    fontWeight={active ? "700" : "400"}
                    bg={active ? "content.alternative" : "background.default"}
                    color={active ? "base.light" : "content.secondary"}
                    borderColor={active ? "content.alternative" : "border.neutral"}
                  >
                    <Icon as={h.icon} boxSize="4" />
                    {h.label}
                  </Button>
                );
              })}
            </Flex>
          </>
        )}

        {/* map — synced to the same filters as the table */}
        <Box
          bg="background.default"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border.neutral"
          overflow="hidden"
          mb="6"
        >
          <CityMap rows={rows} matchIbge={matchIbge} hazards={hazards} onSelect={setSelected} />
          <Flex px="3" py="2" gap="3" fontSize="xs" color="content.tertiary" align="center">
            <Text>
              Dots = filtered cities, colored by CAPAG{hazards.size > 0 ? "; size = selected risk score" : ""}.
              Gray = filtered out. Click a dot for details.
            </Text>
          </Flex>
        </Box>

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
                  <Table.ColumnHeader title="Three highest CCRA hazard scores (normalized 0-100); selected risks first, bold">
                    Top 3 risks
                  </Table.ColumnHeader>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {shown.map((r) => {
                const top3 = topHazards(r.risks, 3, hazards);
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
                        {top3.length > 0 ? (
                          <Flex gap="2.5" wrap="nowrap">
                            {top3.map((t) => {
                              const meta = HAZARD_BY_KEY[t.hazard];
                              if (!meta) return null;
                              return (
                                <Flex
                                  key={t.hazard}
                                  align="center"
                                  gap="0.5"
                                  fontSize="xs"
                                  title={`${meta.label} ${(t.score * 100).toFixed(0)}`}
                                  color={t.score >= HIGH_RISK ? "rating.d" : "content.tertiary"}
                                  fontWeight={t.preferred ? "700" : "400"}
                                >
                                  <Icon as={meta.icon} boxSize="3.5" />
                                  {(t.score * 100).toFixed(0)}
                                </Flex>
                              );
                            })}
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
