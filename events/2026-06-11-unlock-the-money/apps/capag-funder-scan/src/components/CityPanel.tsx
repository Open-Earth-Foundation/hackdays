"use client";

import {
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { MdOpenInNew } from "react-icons/md";
import { recommend } from "../lib/recommend";
import { matchProjects, type Project } from "../lib/matchProjects";
import { HAZARD_BY_KEY, SECTORS } from "../lib/display";
import { fmtBrl } from "../lib/headroom";
import { useTranslation } from "../i18n/client";
import type { CityData } from "../lib/cityData";
import type { Row } from "./Explorer";
import CityIds from "../../data/cities.json";

const CityBoundaryMap = dynamic(() => import("./CityBoundaryMap"), {
  ssr: false,
  loading: () => <Box w="100%" h="100%" bg="background.neutral" />,
});

const INDICATORS = ["debt", "savings", "liquidity"] as const;
const HIGH_RISK = 0.5;

function GradePill({ grade }: { grade: string }) {
  const color =
    grade === "A"
      ? "rating.a"
      : grade === "B"
        ? "rating.b"
        : grade === "C"
          ? "rating.c"
          : "rating.nd";
  return (
    <Badge
      bg={color}
      color="base.light"
      fontWeight="700"
      minW="22px"
      justifyContent="center"
    >
      {grade}
    </Badge>
  );
}

// API values are kg CO2e (CityCatalyst convention, cf. convertKgToTonnes in the CC app)
function fmtMt(co2eqKg: number) {
  const t = co2eqKg / 1e3;
  if (t >= 1e6) return `${(t / 1e6).toFixed(2)} Mt`;
  if (t >= 1e3) return `${(t / 1e3).toFixed(1)} kt`;
  return `${t.toFixed(0)} t`;
}

function fmtUsd(v: number | null) {
  if (v == null) return "—";
  if (v >= 1e9) return `US$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `US$${(v / 1e6).toFixed(0)}M`;
  return `US$${v.toLocaleString()}`;
}

export default function CityPanel({
  row,
  data,
  failed,
  projects,
  onClose,
}: {
  row: Row;
  data: CityData | null;
  failed: boolean;
  projects: Project[];
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const topHazard = data?.hazards?.[0] ?? null;
  const rec = recommend(row.capag, row.icf, topHazard);

  const matches = data
    ? matchProjects(projects, {
        capag: row.capag,
        sectors: data.sectors.map((s) => ({ code: s.code, share: s.share })),
        hazards: data.hazards.map((h) => ({ key: h.hazard, score: h.score })),
      })
    : [];

  // turn a raw match reason ("V emissions" / "floods risk") into localized copy
  const reasonLabel = (reason: string) => {
    const em = reason.match(/^(\w+) emissions$/);
    if (em)
      return `${t(`sector.${em[1]}`)} ${t("panel.projects.viaEmissions")}`;
    const rk = reason.match(/^(.+) risk$/);
    if (rk && HAZARD_BY_KEY[rk[1]])
      return `${t(`hazard.${rk[1]}`)} ${t("panel.projects.viaRisk")}`;
    return reason;
  };

  const renderLine = (line: { key: string; vars?: Record<string, string> }) => {
    const vars: Record<string, string> = {};
    if (line.vars) {
      for (const [k, v] of Object.entries(line.vars)) {
        vars[k] = v.startsWith("hazard.") ? t(v) : v;
      }
    }
    return t(line.key, vars);
  };

  const cityId = (CityIds as Record<string, string>)[row.locode];
  const dashboardUrl = `https://citycatalyst.io/en/public/dashboard/${cityId}/2022/`;

  return (
    <>
      {/* z-index above Leaflet's internal panes/controls (which go up to ~1000) */}
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.400"
        zIndex="1500"
        onClick={onClose}
      />
      <Box
        position="fixed"
        top="0"
        right="0"
        bottom="0"
        w={{ base: "100%", md: "66vw" }}
        maxW="980px"
        bg="background.default"
        zIndex="1600"
        overflowY="auto"
        p={{ base: "6", md: "8" }}
        boxShadow="-4px 0 24px rgba(0,0,31,0.15)"
      >
        <Flex justify="space-between" align="start" mb="2">
          <Heading size="xl" color="content.alternative">
            {row.name}{" "}
            <Text
              as="span"
              color="content.tertiary"
              fontSize="lg"
              fontWeight="400"
            >
              ({row.uf})
            </Text>
          </Heading>
          <Box
            as="button"
            onClick={onClose}
            color="content.tertiary"
            fontSize="2xl"
            px="2"
            cursor="pointer"
            lineHeight="1"
          >
            ✕
          </Box>
        </Flex>
        <Flex
          gap="3"
          wrap="wrap"
          fontSize="xs"
          color="content.tertiary"
          fontFamily="mono"
          mb="5"
        >
          <Text>IBGE {row.ibge}</Text>
          <Text>{row.locode}</Text>
          {data?.context?.area != null && (
            <Text>{data.context.area.toLocaleString()} km²</Text>
          )}
          {data?.context?.regionName && <Text>{data.context.regionName}</Text>}
          {data?.context?.biome && <Text>{data.context.biome}</Text>}
        </Flex>

        {/* selected-city locator map */}
        <Box
          h="220px"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border.neutral"
          overflow="hidden"
          mb="8"
        >
          <CityBoundaryMap
            boundary={data?.boundary ?? null}
            center={
              row.lat != null && row.lng != null ? [row.lat, row.lng] : null
            }
          />
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="10" gapY="8">
          {/* left column: fiscal + emissions + risks */}
          <Box>
            {/* Fiscal */}
            <Heading size="sm" color="content.secondary" mb="2">
              {t("panel.fiscal")}{" "}
              <Badge bg="content.link" color="base.light">
                {row.capag}
              </Badge>
            </Heading>
            <Box
              borderWidth="1px"
              borderColor="border.neutral"
              borderRadius="md"
              p="4"
              mb="2"
            >
              {INDICATORS.map((key) => (
                <Flex key={key} gap="3" align="start" mb="4" _last={{ mb: 0 }}>
                  <GradePill grade={row[key]} />
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="content.primary"
                      mb="0.5"
                    >
                      {t(`indicator.${key}.name`)}
                    </Text>
                    <Text
                      fontSize="xs"
                      color="content.tertiary"
                      lineHeight="1.5"
                    >
                      {t(`indicator.${key}.what`)}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Box>
            <Text
              fontSize="xs"
              color="content.tertiary"
              lineHeight="1.5"
              mb={row.rcl != null ? "3" : "8"}
              dangerouslySetInnerHTML={{
                __html: t("panel.icf", { icf: row.icf }),
              }}
            />
            {row.rcl != null && (
              <Box bg="background.neutral" borderRadius="md" p="3" mb="8">
                <Flex justify="space-between" fontSize="xs" mb="1">
                  <Text color="content.tertiary">{t("panel.rcl")}</Text>
                  <Text color="content.primary" fontWeight="600">{fmtBrl(row.rcl)}</Text>
                </Flex>
                {row.headroomBrl != null && (
                  <Flex justify="space-between" fontSize="xs">
                    <Text color="content.tertiary">{t("panel.headroom")}</Text>
                    <Text color="content.link" fontWeight="700">{fmtBrl(row.headroomBrl)}</Text>
                  </Flex>
                )}
                <Text fontSize="2xs" color="content.tertiary" mt="1.5" lineHeight="1.4">
                  {t("panel.headroomNote")}
                </Text>
              </Box>
            )}

            {/* Emissions */}
            <Heading size="sm" color="content.secondary" mb="3">
              {t("panel.emissions")}{" "}
              {data && (
                <Text
                  as="span"
                  fontWeight="400"
                  color="content.tertiary"
                  fontSize="xs"
                >
                  {t("panel.emissions.total", { value: fmtMt(data.total) })}
                </Text>
              )}
            </Heading>
            {failed && (
              <Text fontSize="sm" color="content.tertiary" mb="4">
                {t("panel.emissions.unavailable")}
              </Text>
            )}
            {!data && !failed && (
              <Spinner size="sm" color="content.link" mb="4" />
            )}
            {data &&
              data.sectors.map((s) => {
                const meta = SECTORS[s.code];
                return (
                  <Box key={s.code} mb="3.5">
                    <Flex
                      justify="space-between"
                      fontSize="xs"
                      mb="0.5"
                      align="center"
                    >
                      <Flex align="center" gap="1.5">
                        {meta && (
                          <Icon as={meta.icon} boxSize="4" color={meta.color} />
                        )}
                        <Text color="content.primary" fontWeight="500">
                          {t(`sector.${s.code}`)}
                        </Text>
                        <Text color="content.tertiary" fontSize="2xs">
                          {s.sources.join(" + ")}
                        </Text>
                      </Flex>
                      <Text color="content.tertiary">
                        {fmtMt(s.co2eq)} · {(s.share * 100).toFixed(0)}%
                      </Text>
                    </Flex>
                    <Box bg="background.neutral" borderRadius="full" h="8px">
                      <Box
                        bg={meta?.color ?? "content.link"}
                        borderRadius="full"
                        h="8px"
                        w={`${Math.max(s.share * 100, 2)}%`}
                      />
                    </Box>
                  </Box>
                );
              })}
            {data && !data.sectors.some((s) => s.code === "III") && (
              <Text fontSize="xs" color="content.tertiary" mt="1">
                {t("panel.emissions.noWaste")}
              </Text>
            )}

            {/* Risks */}
            <Heading size="sm" color="content.secondary" mb="3" mt="8">
              {t("panel.risks")}{" "}
              <Text
                as="span"
                fontWeight="400"
                color="content.tertiary"
                fontSize="xs"
              >
                {t("panel.risks.caption")}
              </Text>
            </Heading>
            {data && data.hazards.length > 0
              ? data.hazards.map((h) => (
                  <Box key={h.hazard} mb="3.5">
                    <Flex justify="space-between" fontSize="xs" mb="0.5">
                      <Flex align="center" gap="1.5">
                        {HAZARD_BY_KEY[h.hazard] && (
                          <Icon
                            as={HAZARD_BY_KEY[h.hazard].icon}
                            boxSize="4"
                            color="content.secondary"
                          />
                        )}
                        <Text color="content.primary" fontWeight="500">
                          {HAZARD_BY_KEY[h.hazard]
                            ? t(`hazard.${h.hazard}`)
                            : h.hazard}
                        </Text>
                      </Flex>
                      <Text color="content.tertiary">
                        {(h.score * 100).toFixed(0)}
                      </Text>
                    </Flex>
                    <Box bg="background.neutral" borderRadius="full" h="8px">
                      <Box
                        bg={h.score >= HIGH_RISK ? "rating.c" : "rating.bplus"}
                        borderRadius="full"
                        h="8px"
                        w={`${Math.max(h.score * 100, 2)}%`}
                      />
                    </Box>
                  </Box>
                ))
              : data && (
                  <Text fontSize="sm" color="content.tertiary">
                    {t("panel.risks.none")}
                  </Text>
                )}
          </Box>

          {/* right column: recommendation + comparable funded projects */}
          <Box>
            <Heading size="sm" color="content.secondary" mb="3">
              {t("panel.recommendation")}
            </Heading>
            <Box bg="background.neutral" borderRadius="md" p="4" mb="8">
              <Text
                fontWeight="700"
                fontSize="md"
                color="content.alternative"
                mb="2"
              >
                {t(rec.instrumentKey)}
              </Text>
              {rec.reasoning.map((line, i) => (
                <Text
                  key={i}
                  fontSize="xs"
                  color="content.secondary"
                  mb="1.5"
                  lineHeight="1.5"
                  _last={{ mb: 0 }}
                >
                  • {renderLine(line)}
                </Text>
              ))}
            </Box>

            <Heading size="sm" color="content.secondary" mb="1">
              {t("panel.projects")}
            </Heading>
            <Text
              fontSize="xs"
              color="content.tertiary"
              mb="4"
              lineHeight="1.5"
            >
              {t("panel.projects.caption")}
            </Text>
            {!data && !failed && <Spinner size="sm" color="content.link" />}
            {data && matches.length === 0 && (
              <Text fontSize="sm" color="content.tertiary">
                {t("panel.projects.none")}
              </Text>
            )}
            {matches.map((p) => (
              <Box
                key={p.id}
                borderWidth="1px"
                borderColor="border.neutral"
                borderRadius="md"
                p="4"
                mb="3"
              >
                <Flex justify="space-between" gap="2" align="start" mb="2">
                  <Text fontSize="sm" fontWeight="600" color="content.primary">
                    {p.title}
                  </Text>
                  {p.source && (
                    <Link
                      href={p.source}
                      target="_blank"
                      color="content.link"
                      flexShrink={0}
                    >
                      <Icon as={MdOpenInNew} boxSize="3.5" />
                    </Link>
                  )}
                </Flex>
                <Flex gap="1.5" wrap="wrap" mb="1.5">
                  <Badge
                    bg="background.overlay"
                    color="content.secondary"
                    fontSize="2xs"
                  >
                    {p.city}, {p.country}
                  </Badge>
                  <Badge
                    bg="background.neutral"
                    color="content.secondary"
                    fontSize="2xs"
                  >
                    {p.instrument}
                  </Badge>
                  {p.amountUsd != null && (
                    <Badge bg="rating.a" color="base.light" fontSize="2xs">
                      {fmtUsd(p.amountUsd)}
                    </Badge>
                  )}
                  <Badge
                    bg="background.neutral"
                    color="content.tertiary"
                    fontSize="2xs"
                  >
                    {p.status}
                  </Badge>
                </Flex>
                <Text fontSize="xs" color="content.tertiary" mb="1.5">
                  {p.summary}
                </Text>
                {p.why.length > 0 && (
                  <Flex gap="1" wrap="wrap" mb="1">
                    <Text
                      fontSize="2xs"
                      color="content.tertiary"
                      fontWeight="600"
                    >
                      {t("panel.projects.matchedOn")}:
                    </Text>
                    <Text fontSize="2xs" color="content.link">
                      {p.why
                        .filter(
                          (r) => r.endsWith("emissions") || r.endsWith("risk"),
                        )
                        .map(reasonLabel)
                        .join(" · ")}
                    </Text>
                  </Flex>
                )}
                <Text fontSize="2xs" color="content.tertiary">
                  {p.funders.length ? p.funders.join(", ") : ""}
                </Text>
              </Box>
            ))}
          </Box>
        </SimpleGrid>

        <Text fontSize="xs" color="content.tertiary" my="6">
          {t("panel.disclaimer")}
        </Text>

        <iframe
          src={dashboardUrl}
          loading="lazy"
          style={{
            width: "100%",
            height: "2800px",
            border: "medium",
            borderRadius: "12px",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
            padding: "0px 32px",
          }}
        ></iframe>
      </Box>
    </>
  );
}
