"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { MdOutlineFileDownload, MdOutlineFilterAltOff, MdOutlineZoomInMap } from "react-icons/md";
import CityPanel from "./CityPanel";
import { HAZARDS, HAZARD_BY_KEY, TIER_HEX } from "../lib/display";

const CityMap = dynamic(() => import("./CityMap"), {
  ssr: false,
  loading: () => <Box h="100%" bg="background.neutral" />,
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
  C: "no federal credit",
  D: "bottom tier",
  "n.d.": "not rated → TA",
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

function exportCsv(rows: Row[]) {
  const hazardCols = HAZARDS.map((h) => h.key);
  const header = [
    "ibge", "municipality", "uf", "capag", "debt", "savings", "liquidity", "icf", "locode",
    ...hazardCols.map((h) => `risk_${h}`),
  ];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.ibge, esc(r.name), r.uf, r.capag, r.debt, r.savings, r.liquidity, r.icf, r.locode,
        ...hazardCols.map((h) => (r.risks?.[h] != null ? (r.risks[h] * 100).toFixed(0) : "")),
      ].join(",")
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "capag-funder-scan.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Explorer({ rows }: { rows: Row[] }) {
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [hazards, setHazards] = useState<Set<string>>(new Set());
  const [uf, setUf] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const restored = useRef(false);

  // one-shot URL → state restoration (ref latch: never re-runs, so no swap loop)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tiers");
    const h = p.get("risks");
    if (t) setTiers(new Set(t.split(",").filter((x) => (TIERS as readonly string[]).includes(x))));
    if (h) setHazards(new Set(h.split(",").filter((x) => HAZARD_BY_KEY[x])));
    setUf(p.get("uf") ?? "");
    setQ(p.get("q") ?? "");
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // state → URL (write-only; guarded until restoration ran)
  useEffect(() => {
    if (!restored.current) return;
    const p = new URLSearchParams();
    if (tiers.size) p.set("tiers", Array.from(tiers).join(","));
    if (hazards.size) p.set("risks", Array.from(hazards).join(","));
    if (uf) p.set("uf", uf);
    if (q) p.set("q", q);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [tiers, hazards, uf, q]);

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
  const activeFilters = tiers.size + hazards.size + (uf ? 1 : 0) + (q.trim() ? 1 : 0);

  const clearAll = () => {
    setTiers(new Set());
    setHazards(new Set());
    setUf("");
    setQ("");
  };

  return (
    <>
      {/* CC-style top bar */}
      <Box bg="content.alternative" py="3">
        <Container maxW="7xl">
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

      <Container maxW="7xl" py="6">
        <Text color="content.tertiary" fontSize="sm" mb="5">
          {rows.length.toLocaleString()} Brazilian municipalities. Indicative screening signal,
          not a credit decision.
        </Text>

        {/* map left · filters right */}
        <Flex gap="5" mb="6" direction={{ base: "column", lg: "row" }} align="stretch">
          <Box
            flex="1"
            minW="0"
            position="relative"
            bg="background.default"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.neutral"
            overflow="hidden"
            minH={{ base: "320px", lg: "400px" }}
          >
            <CityMap
              rows={rows}
              matchIbge={matchIbge}
              hazards={hazards}
              fitSignal={fitSignal}
              onSelect={setSelected}
            />
            {/* legend */}
            <Box
              position="absolute"
              bottom="3"
              left="3"
              bg="background.default"
              borderRadius="md"
              borderWidth="1px"
              borderColor="border.neutral"
              px="2.5"
              py="2"
              zIndex={1000}
              boxShadow="0 1px 6px rgba(0,0,31,0.12)"
            >
              <Flex gap="2.5" wrap="wrap">
                {TIERS.map((t) => (
                  <Flex key={t} align="center" gap="1" fontSize="2xs" color="content.secondary">
                    <Box w="2.5" h="2.5" borderRadius="full" bg={TIER_HEX[t]} />
                    {t}
                  </Flex>
                ))}
              </Flex>
              {hazards.size > 0 && (
                <Text fontSize="2xs" color="content.tertiary" mt="1">
                  dot size = selected risk score
                </Text>
              )}
            </Box>
            {/* zoom to selection */}
            <Button
              position="absolute"
              top="3"
              right="3"
              zIndex={1000}
              size="xs"
              bg="background.default"
              color="content.secondary"
              borderWidth="1px"
              borderColor="border.neutral"
              onClick={() => setFitSignal((s) => s + 1)}
            >
              <Icon as={MdOutlineZoomInMap} boxSize="3.5" />
              Zoom to selection
            </Button>
          </Box>

          {/* filter rail */}
          <Box w={{ base: "100%", lg: "400px" }} flexShrink={0}>
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="xs" fontWeight="700" color="content.secondary" textTransform="uppercase" letterSpacing="wide">
                Fiscal capacity (CAPAG)
              </Text>
              {activeFilters > 0 && (
                <Button size="xs" variant="ghost" color="content.link" onClick={clearAll}>
                  <Icon as={MdOutlineFilterAltOff} boxSize="3.5" />
                  Clear ({activeFilters})
                </Button>
              )}
            </Flex>
            <SimpleGrid columns={2} gap="2" mb="4">
              {TIERS.map((t) => {
                const active = tiers.has(t);
                return (
                  <Button
                    key={t}
                    onClick={() => setTiers(toggle(tiers, t))}
                    variant="outline"
                    h="auto"
                    py="2"
                    px="2.5"
                    bg={active ? "content.alternative" : "background.default"}
                    borderColor={active ? "content.alternative" : "border.neutral"}
                    borderWidth="2px"
                    display="block"
                    textAlign="left"
                  >
                    <Flex align="center" gap="2">
                      <TierBadge tier={t} />
                      <Text fontWeight="700" fontFamily="heading" fontSize="sm" color={active ? "base.light" : "content.primary"}>
                        {(counts[t] ?? 0).toLocaleString()}
                      </Text>
                    </Flex>
                    <Text fontSize="2xs" color={active ? "background.overlay" : "content.tertiary"} mt="0.5" fontWeight="400">
                      {TIER_LABELS[t]}
                    </Text>
                  </Button>
                );
              })}
            </SimpleGrid>

            {hasRisks && (
              <>
                <Text fontSize="xs" fontWeight="700" color="content.secondary" textTransform="uppercase" letterSpacing="wide" mb="2">
                  High climate risk (≥ 50, any selected)
                </Text>
                <Flex gap="1.5" wrap="wrap" mb="4">
                  {HAZARDS.map((h) => {
                    const active = hazards.has(h.key);
                    return (
                      <Button
                        key={h.key}
                        onClick={() => setHazards(toggle(hazards, h.key))}
                        variant="outline"
                        size="xs"
                        borderRadius="full"
                        fontWeight={active ? "700" : "400"}
                        bg={active ? "content.alternative" : "background.default"}
                        color={active ? "base.light" : "content.secondary"}
                        borderColor={active ? "content.alternative" : "border.neutral"}
                      >
                        <Icon as={h.icon} boxSize="3.5" />
                        {h.label}
                      </Button>
                    );
                  })}
                </Flex>
              </>
            )}

          </Box>
        </Flex>

        {/* full-width search / state / matches row below the map+filters */}
        <Flex
          gap="3"
          mb="5"
          align="center"
          wrap="wrap"
          bg="background.default"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border.neutral"
          p="3"
        >
          <Input
            placeholder="Search municipality…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            bg="background.default"
            flex="1"
            minW="220px"
          />
          <NativeSelect.Root bg="background.default" w="180px" flexShrink={0}>
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
          <Flex align="center" gap="1" flexShrink={0}>
            <Text fontSize="sm" color="content.primary" fontWeight="700">
              {filtered.length.toLocaleString()}
            </Text>
            <Text fontSize="sm" color="content.tertiary">
              match{filtered.length === 1 ? "" : "es"}
              {hazards.size > 0 ? " · sorted by risk" : ""}
            </Text>
          </Flex>
          <Button
            size="sm"
            variant="outline"
            color="content.link"
            borderColor="border.neutral"
            flexShrink={0}
            onClick={() => exportCsv(filtered)}
          >
            <Icon as={MdOutlineFileDownload} boxSize="4" />
            Export CSV
          </Button>
        </Flex>

        <Text fontSize="sm" color="content.tertiary" mb="2">
          {filtered.length > shown.length ? `Showing first ${shown.length} of ${filtered.length.toLocaleString()}` : ""}
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
