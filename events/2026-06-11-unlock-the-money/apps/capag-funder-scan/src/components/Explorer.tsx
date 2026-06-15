"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  NativeSelect,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import {
  MdBolt,
  MdNavigateBefore,
  MdNavigateNext,
  MdOutlineAutoAwesome,
  MdOutlineFileDownload,
  MdOutlineFilterAltOff,
  MdOutlineInfo,
  MdOutlineZoomInMap,
} from "react-icons/md";
import CityPanel from "./CityPanel";
import LanguageToggle from "./LanguageToggle";
import MandateWizard, { type Mandate } from "./MandateWizard";
import OnboardingCarousel from "./OnboardingCarousel";
import { HAZARDS, HAZARD_BY_KEY, TIER_HEX } from "../lib/display";
import { useTranslation } from "../i18n/client";
import type { CityData } from "../lib/cityData";
import type { Project } from "../lib/matchProjects";
import type { Leverage } from "../lib/leverage";
import { instrumentGroup, INSTRUMENT_LABEL_KEY, type InstrumentGroup } from "../lib/instrument";
import { fmtBrl } from "../lib/headroom";

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
  leverage: Leverage | null;
  rcl: number | null;
  headroomBrl: number | null;
  unlockBrl: number;
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

function topHazards(
  risks: Record<string, number> | null,
  n: number,
  prefer?: Set<string>,
) {
  if (!risks) return [];
  return Object.entries(risks)
    .map(([hazard, score]) => ({
      hazard,
      score,
      preferred: !!prefer?.has(hazard),
    }))
    .sort((a, b) =>
      a.preferred !== b.preferred ? (a.preferred ? -1 : 1) : b.score - a.score,
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
    "ibge",
    "municipality",
    "uf",
    "capag",
    "instrument",
    "debt",
    "savings",
    "liquidity",
    "icf",
    "leverage",
    "leverage_blockers",
    "rcl_brl",
    "headroom_brl",
    "unlock_brl",
    "locode",
    ...hazardCols.map((h) => `risk_${h}`),
  ];
  const esc = (v: string) =>
    /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.ibge,
        esc(r.name),
        r.uf,
        r.capag,
        instrumentGroup(r.capag),
        r.debt,
        r.savings,
        r.liquidity,
        r.icf,
        r.leverage?.kind ?? "",
        r.leverage ? esc(r.leverage.blockers.join("|")) : "",
        r.rcl ?? "",
        r.headroomBrl ?? "",
        r.unlockBrl || "",
        r.locode,
        ...hazardCols.map((h) =>
          r.risks?.[h] != null ? (r.risks[h] * 100).toFixed(0) : "",
        ),
      ].join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "capag-funder-scan.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Explorer({
  rows,
  projects,
}: {
  rows: Row[];
  projects: Project[];
}) {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [hazards, setHazards] = useState<Set<string>>(new Set());
  const [uf, setUf] = useState("");
  const [q, setQ] = useState("");
  const [instrument, setInstrument] = useState<InstrumentGroup | "any">("any");
  const [highLevOnly, setHighLevOnly] = useState(false);
  const [sort, setSort] = useState<"match" | "leverage">("match");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  // show the onboarding carousel once per browser
  useEffect(() => {
    if (!window.localStorage.getItem("capag-seen-intro")) setIntroOpen(true);
  }, []);
  const closeIntro = () => {
    window.localStorage.setItem("capag-seen-intro", "1");
    setIntroOpen(false);
  };
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [cityFailed, setCityFailed] = useState(false);
  const [fitSignal, setFitSignal] = useState(0);
  const restored = useRef(false);

  // single city-detail fetch shared by the panel (all sections) and the map (boundary polygon)
  useEffect(() => {
    if (!selected) {
      setCityData(null);
      setCityFailed(false);
      return;
    }
    let cancelled = false;
    setCityData(null);
    setCityFailed(false);
    fetch(`/api/city/${encodeURIComponent(selected.locode)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelled && setCityData(d))
      .catch(() => !cancelled && setCityFailed(true));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // one-shot URL → state restoration (ref latch: never re-runs, so no swap loop)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tiers");
    const h = p.get("risks");
    if (t)
      setTiers(
        new Set(
          t.split(",").filter((x) => (TIERS as readonly string[]).includes(x)),
        ),
      );
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
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname,
    );
  }, [tiers, hazards, uf, q]);

  const hasRisks = useMemo(() => rows.some((r) => r.risks), [rows]);
  const ufs = useMemo(
    () => Array.from(new Set(rows.map((r) => r.uf))).sort(),
    [rows],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.capag] = (c[r.capag] ?? 0) + 1;
    return c;
  }, [rows]);

  const itemsPerPage = 300;
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    setPage(0);
    const needle = q.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        (tiers.size === 0 || tiers.has(r.capag)) &&
        (instrument === "any" || instrumentGroup(r.capag) === instrument) &&
        (!uf || r.uf === uf) &&
        (!needle || r.name.toLowerCase().includes(needle)) &&
        (!highLevOnly || r.leverage != null) &&
        (hazards.size === 0 ||
          Array.from(hazards).some((h) => (r.risks?.[h] ?? 0) >= HIGH_RISK)),
    );
    if (sort === "leverage") {
      out.sort(
        (a, b) =>
          (b.leverage?.rank ?? 0) - (a.leverage?.rank ?? 0) ||
          b.unlockBrl - a.unlockBrl,
      );
    } else if (hazards.size > 0) {
      const sel = (r: Row) =>
        Math.max(...Array.from(hazards).map((h) => r.risks?.[h] ?? 0));
      out.sort((a, b) => sel(b) - sel(a));
    }
    return out;
  }, [rows, tiers, instrument, uf, q, highLevOnly, hazards, sort]);

  const pageStart = itemsPerPage * page;
  const pageEnd = Math.min(pageStart + itemsPerPage, filtered.length);
  const shown = filtered.slice(pageStart, pageEnd);
  const maxPage = Math.floor(filtered.length / itemsPerPage);

  const matchIbge = useMemo(
    () => new Set(filtered.map((r) => r.ibge)),
    [filtered],
  );
  const totalUnlock = useMemo(
    () => filtered.reduce((s, r) => s + r.unlockBrl, 0),
    [filtered],
  );
  // aggregation cue: dominant instrument group among matches → bundle into one facility
  const bundle = useMemo(() => {
    const cnt: Record<string, number> = {};
    for (const r of filtered) {
      const g = instrumentGroup(r.capag);
      cnt[g] = (cnt[g] ?? 0) + 1;
    }
    let top: string | null = null;
    let n = 0;
    for (const k in cnt) if (cnt[k] > n) ((n = cnt[k]), (top = k));
    return top && n >= 3 ? { group: top as InstrumentGroup, n } : null;
  }, [filtered]);
  const activeFilters =
    tiers.size +
    hazards.size +
    (uf ? 1 : 0) +
    (q.trim() ? 1 : 0) +
    (instrument !== "any" ? 1 : 0) +
    (highLevOnly ? 1 : 0);

  const clearAll = () => {
    setTiers(new Set());
    setHazards(new Set());
    setUf("");
    setQ("");
    setInstrument("any");
    setHighLevOnly(false);
    setSort("match");
    setPage(0);
  };

  const applyMandate = (m: Mandate) => {
    setInstrument(m.instrument);
    setTiers(new Set());
    setUf(m.uf);
    setHazards(new Set(m.hazards));
    setSort("leverage");
    setHighLevOnly(false);
    setQ("");
    setWizardOpen(false);
  };

  return (
    <>
      {/* CC-style top bar */}
      <Box bg="content.alternative" py="3">
        <Container maxW="7xl">
          <Flex align="center" gap="3">
            <Heading size="md" fontFamily="heading" color="base.light">
              {t("app.title")}
            </Heading>
            <Text
              fontSize="xs"
              color="background.overlay"
              display={{ base: "none", md: "block" }}
            >
              {t("app.subtitle")}
            </Text>
            <Box flex="1" />
            <Box
              as="button"
              onClick={() => setIntroOpen(true)}
              color="background.overlay"
              _hover={{ color: "base.light" }}
              title={t("intro.openTitle")}
              display="flex"
              alignItems="center"
            >
              <Icon as={MdOutlineInfo} boxSize="5" />
            </Box>
            <Button
              size="sm"
              bg="base.light"
              color="content.alternative"
              fontWeight="700"
              _hover={{ bg: "background.overlay" }}
              onClick={() => setWizardOpen(true)}
            >
              <Icon as={MdOutlineAutoAwesome} boxSize="4" />
              {t("mandate.build")}
            </Button>
            <LanguageToggle />
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py="6">
        <Text color="content.tertiary" fontSize="sm" mb="5">
          {t("app.intro", { count: rows.length })}
        </Text>

        {/* map left · filters right */}
        <Flex
          gap="5"
          mb="6"
          direction={{ base: "column", lg: "row" }}
          align="stretch"
        >
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
                {TIERS.map((tier) => (
                  <Flex
                    key={tier}
                    align="center"
                    gap="1"
                    fontSize="2xs"
                    color="content.secondary"
                  >
                    <Box
                      w="2.5"
                      h="2.5"
                      borderRadius="full"
                      bg={TIER_HEX[tier]}
                    />
                    {tier}
                  </Flex>
                ))}
              </Flex>
              {hazards.size > 0 && (
                <Text fontSize="2xs" color="content.tertiary" mt="1">
                  {t("map.dotSize")}
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
              {t("map.zoomToSelection")}
            </Button>
          </Box>

          {/* filter rail */}
          <Box w={{ base: "100%", lg: "400px" }} flexShrink={0}>
            {/* funder mandate (inline) */}
            <Box
              bg="background.default"
              borderWidth="1px"
              borderColor="border.neutral"
              borderRadius="md"
              p="3"
              mb="4"
            >
              <Text
                fontSize="xs"
                fontWeight="700"
                color="content.secondary"
                textTransform="uppercase"
                letterSpacing="wide"
                mb="2"
              >
                {t("mandate.title")}
              </Text>
              <NativeSelect.Root bg="background.default" mb="2">
                <NativeSelect.Field
                  value={instrument}
                  onChange={(e) =>
                    setInstrument(e.target.value as InstrumentGroup | "any")
                  }
                >
                  <option value="any">{t("instr.any")}</option>
                  <option value="credit">{t("instr.credit")}</option>
                  <option value="blended">{t("instr.blended")}</option>
                  <option value="grant_ta">{t("instr.grant_ta")}</option>
                  <option value="distressed">{t("instr.distressed")}</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Flex gap="2" align="center">
                <Button
                  size="xs"
                  flex="1"
                  variant="outline"
                  fontWeight={highLevOnly ? "700" : "400"}
                  bg={highLevOnly ? "content.alternative" : "background.default"}
                  color={highLevOnly ? "base.light" : "content.secondary"}
                  borderColor={
                    highLevOnly ? "content.alternative" : "border.neutral"
                  }
                  onClick={() => setHighLevOnly((v) => !v)}
                >
                  <Icon as={MdBolt} boxSize="3.5" />
                  {t("filters.highLeverage")}
                </Button>
                <Flex
                  borderWidth="1px"
                  borderColor="border.neutral"
                  borderRadius="md"
                  overflow="hidden"
                >
                  {(["match", "leverage"] as const).map((s) => (
                    <Button
                      key={s}
                      size="xs"
                      borderRadius="0"
                      fontWeight={sort === s ? "700" : "400"}
                      bg={sort === s ? "content.alternative" : "background.default"}
                      color={sort === s ? "base.light" : "content.secondary"}
                      onClick={() => setSort(s)}
                    >
                      {t(`sort.${s}`)}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            </Box>

            <Flex justify="space-between" align="center" mb="2">
              <Text
                fontSize="xs"
                fontWeight="700"
                color="content.secondary"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {t("filters.fiscal")}
              </Text>
              {activeFilters > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="content.link"
                  onClick={clearAll}
                >
                  <Icon as={MdOutlineFilterAltOff} boxSize="3.5" />
                  {t("filters.clear", { count: activeFilters })}
                </Button>
              )}
            </Flex>
            <SimpleGrid columns={2} gap="2" mb="4">
              {TIERS.map((tier) => {
                const active = tiers.has(tier);
                return (
                  <Button
                    key={tier}
                    onClick={() => setTiers(toggle(tiers, tier))}
                    variant="outline"
                    h="auto"
                    py="2"
                    px="2.5"
                    bg={active ? "content.alternative" : "background.default"}
                    borderColor={
                      active ? "content.alternative" : "border.neutral"
                    }
                    borderWidth="2px"
                    display="block"
                    textAlign="left"
                  >
                    <Flex align="center" gap="2">
                      <TierBadge tier={tier} />
                      <Text
                        fontWeight="700"
                        fontFamily="heading"
                        fontSize="sm"
                        color={active ? "base.light" : "content.primary"}
                      >
                        {(counts[tier] ?? 0).toLocaleString()}
                      </Text>
                    </Flex>
                    <Text
                      fontSize="2xs"
                      color={active ? "background.overlay" : "content.tertiary"}
                      mt="0.5"
                      fontWeight="400"
                    >
                      {t(`tier.${tier}.label`)}
                    </Text>
                  </Button>
                );
              })}
            </SimpleGrid>

            {hasRisks && (
              <>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="content.secondary"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb="2"
                >
                  {t("filters.risk")}
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
                        bg={
                          active ? "content.alternative" : "background.default"
                        }
                        color={active ? "base.light" : "content.secondary"}
                        borderColor={
                          active ? "content.alternative" : "border.neutral"
                        }
                      >
                        <Icon as={h.icon} boxSize="3.5" />
                        {t(`hazard.${h.key}`)}
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
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            bg="background.default"
            flex="1"
            minW="220px"
          />
          <NativeSelect.Root bg="background.default" w="180px" flexShrink={0}>
            <NativeSelect.Field
              value={uf}
              onChange={(e) => setUf(e.target.value)}
            >
              <option value="">{t("search.allStates")}</option>
              {ufs.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Flex align="center" gap="2" flexShrink={0}>
            <Text fontSize="sm" color="content.tertiary">
              {t("search.matches", { count: filtered.length })}
            </Text>
            {totalUnlock > 0 && (
              <Text fontSize="sm" fontWeight="700" color="content.link" title={t("pipeline.deployableHint")}>
                {t("pipeline.deployable", { value: fmtBrl(totalUnlock) })}
              </Text>
            )}
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
            {t("search.export")}
          </Button>
        </Flex>

        {filtered.length > shown.length && (
          <HStack mb={2}>
            <IconButton
              variant="ghost"
              onClick={() => {
                if (page > 0) {
                  setPage(page - 1);
                }
              }}
            >
              <Icon as={MdNavigateBefore} />
            </IconButton>
            <Text fontSize="sm" color="content.tertiary" spaceX={2}>
              {t("table.showing", {
                start: pageStart,
                end: pageEnd,
                total: filtered.length,
              })}
            </Text>
            <IconButton
              variant="ghost"
              onClick={() => {
                if (page < maxPage) {
                  setPage(page + 1);
                }
              }}
            >
              <Icon as={MdNavigateNext} />
            </IconButton>
          </HStack>
        )}

        {bundle && (
          <Flex
            align="center"
            gap="2"
            mb="3"
            bg="background.neutral"
            borderRadius="md"
            px="3"
            py="2.5"
          >
            <Icon as={MdOutlineAutoAwesome} boxSize="4" color="content.link" />
            <Text fontSize="sm" color="content.secondary">
              {t("pipeline.bundle", {
                count: bundle.n,
                instrument: t(INSTRUMENT_LABEL_KEY[bundle.group]),
              })}
            </Text>
          </Flex>
        )}

        <Box
          bg="background.default"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border.neutral"
          overflow="hidden"
        >
          <Table.Root size="sm" striped>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t("col.municipality")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("col.uf")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("col.capag")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("col.instrument")}</Table.ColumnHeader>
                <Table.ColumnHeader title={t("indicator.debt.what")}>
                  {t("col.debt")}
                </Table.ColumnHeader>
                <Table.ColumnHeader title={t("indicator.savings.what")}>
                  {t("col.savings")}
                </Table.ColumnHeader>
                <Table.ColumnHeader title={t("indicator.liquidity.what")}>
                  {t("col.liquidity")}
                </Table.ColumnHeader>
                <Table.ColumnHeader>{t("col.icf")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("col.leverage")}</Table.ColumnHeader>
                {hasRisks && (
                  <Table.ColumnHeader>{t("col.top3")}</Table.ColumnHeader>
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
                    <Table.Cell fontSize="xs" color="content.secondary">
                      {t(INSTRUMENT_LABEL_KEY[instrumentGroup(r.capag)])}
                    </Table.Cell>
                    <Table.Cell>{r.debt}</Table.Cell>
                    <Table.Cell>{r.savings}</Table.Cell>
                    <Table.Cell>{r.liquidity}</Table.Cell>
                    <Table.Cell color="content.tertiary">{r.icf}</Table.Cell>
                    <Table.Cell>
                      {r.leverage ? (
                        <Box
                          title={r.leverage.blockers
                            .map((b) => t(`lev.blocker.${b}`))
                            .join(", ")}
                        >
                          <Flex align="center" gap="1" fontSize="2xs" fontWeight="700" color="content.link">
                            <Icon as={MdBolt} boxSize="3.5" />
                            {t(`lev.${r.leverage.kind}`)}
                          </Flex>
                          {r.unlockBrl > 0 && (
                            <Text fontSize="2xs" color="content.tertiary" mt="0.5">
                              {t("lev.unlocks", { value: fmtBrl(r.unlockBrl) })}
                            </Text>
                          )}
                        </Box>
                      ) : r.headroomBrl != null && r.headroomBrl > 0 && instrumentGroup(r.capag) === "credit" ? (
                        <Text fontSize="2xs" color="content.tertiary" title={t("lev.headroomHint")}>
                          {t("lev.headroom", { value: fmtBrl(r.headroomBrl) })}
                        </Text>
                      ) : (
                        <Text fontSize="xs" color="content.tertiary">
                          —
                        </Text>
                      )}
                    </Table.Cell>
                    {hasRisks && (
                      <Table.Cell>
                        {top3.length > 0 ? (
                          <Flex gap="2.5" wrap="nowrap">
                            {top3.map((hz) => {
                              const meta = HAZARD_BY_KEY[hz.hazard];
                              if (!meta) return null;
                              return (
                                <Flex
                                  key={hz.hazard}
                                  align="center"
                                  gap="0.5"
                                  fontSize="xs"
                                  title={`${t(`hazard.${hz.hazard}`)} ${(hz.score * 100).toFixed(0)}`}
                                  color={
                                    hz.score >= HIGH_RISK
                                      ? "rating.d"
                                      : "content.tertiary"
                                  }
                                  fontWeight={hz.preferred ? "700" : "400"}
                                >
                                  <Icon as={meta.icon} boxSize="3.5" />
                                  {(hz.score * 100).toFixed(0)}
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
        {selected && (
          <CityPanel
            row={selected}
            data={cityData}
            failed={cityFailed}
            projects={projects}
            onClose={() => setSelected(null)}
          />
        )}
        {wizardOpen && (
          <MandateWizard
            ufs={ufs}
            resultCount={(m) =>
              rows.filter(
                (r) =>
                  (m.instrument === "any" ||
                    instrumentGroup(r.capag) === m.instrument) &&
                  (!m.uf || r.uf === m.uf) &&
                  (m.hazards.length === 0 ||
                    m.hazards.some((h) => (r.risks?.[h] ?? 0) >= HIGH_RISK)),
              ).length
            }
            onApply={applyMandate}
            onClose={() => setWizardOpen(false)}
          />
        )}
        {introOpen && <OnboardingCarousel onClose={closeIntro} />}
      </Container>
    </>
  );
}
