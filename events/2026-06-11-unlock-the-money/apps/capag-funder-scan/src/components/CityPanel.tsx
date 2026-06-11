"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Icon, Spinner, Text } from "@chakra-ui/react";
import { recommend } from "../lib/recommend";
import { HAZARD_BY_KEY, SECTORS } from "../lib/display";
import { useTranslation } from "../i18n/client";
import type { Row } from "./Explorer";

type CityData = {
  total: number;
  sectors: { code: string; name: string; co2eq: number; share: number; sources: string[] }[];
  hazards: { hazard: string; score: number }[];
};

const INDICATORS = ["debt", "savings", "liquidity"] as const;

function GradePill({ grade }: { grade: string }) {
  const color = grade === "A" ? "rating.a" : grade === "B" ? "rating.b" : grade === "C" ? "rating.c" : "rating.nd";
  return (
    <Badge bg={color} color="base.light" fontWeight="700" minW="22px" justifyContent="center">
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

export default function CityPanel({ row, onClose }: { row: Row; onClose: () => void }) {
  const { t } = useTranslation();
  const [data, setData] = useState<CityData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setData(null);
    setFailed(false);
    fetch(`/api/city/${encodeURIComponent(row.locode)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
  }, [row.locode]);

  const topHazard = data?.hazards?.[0] ?? null;
  const rec = recommend(row.capag, row.icf, topHazard);

  // resolve a recommendation line: hazard-key vars are translated before interpolation
  const renderLine = (line: { key: string; vars?: Record<string, string> }) => {
    const vars: Record<string, string> = {};
    if (line.vars) {
      for (const [k, v] of Object.entries(line.vars)) {
        vars[k] = v.startsWith("hazard.") ? t(v) : v;
      }
    }
    return t(line.key, vars);
  };

  return (
    <>
      <Box position="fixed" inset="0" bg="blackAlpha.400" zIndex="10" onClick={onClose} />
      <Box
        position="fixed"
        top="0"
        right="0"
        bottom="0"
        w={{ base: "100%", md: "480px" }}
        bg="background.default"
        zIndex="11"
        overflowY="auto"
        p="6"
        boxShadow="-4px 0 24px rgba(0,0,31,0.15)"
      >
        <Flex justify="space-between" align="start" mb="1">
          <Heading size="lg" color="content.alternative">
            {row.name} <Text as="span" color="content.tertiary" fontSize="md">({row.uf})</Text>
          </Heading>
          <Box as="button" onClick={onClose} color="content.tertiary" fontSize="xl" px="2" cursor="pointer">
            ✕
          </Box>
        </Flex>
        <Text fontSize="xs" color="content.tertiary" fontFamily="mono" mb="4">
          IBGE {row.ibge} · {row.locode}
        </Text>

        {/* Fiscal */}
        <Heading size="sm" color="content.secondary" mb="2">
          {t("panel.fiscal")} <Badge bg="content.link" color="base.light">{row.capag}</Badge>
        </Heading>
        <Box borderWidth="1px" borderColor="border.neutral" borderRadius="md" p="3" mb="1">
          {INDICATORS.map((key) => (
            <Flex key={key} gap="2" align="start" mb="2.5" _last={{ mb: 0 }}>
              <GradePill grade={row[key]} />
              <Box>
                <Text fontSize="sm" fontWeight="600" color="content.primary">
                  {t(`indicator.${key}.name`)}
                </Text>
                <Text fontSize="xs" color="content.tertiary">
                  {t(`indicator.${key}.what`)}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
        <Text
          fontSize="xs"
          color="content.tertiary"
          mb="4"
          dangerouslySetInnerHTML={{ __html: t("panel.icf", { icf: row.icf }) }}
        />

        {/* Emissions */}
        <Heading size="sm" color="content.secondary" mb="2">
          {t("panel.emissions")}{" "}
          {data && (
            <Text as="span" fontWeight="400" color="content.tertiary" fontSize="xs">
              {t("panel.emissions.total", { value: fmtMt(data.total) })}
            </Text>
          )}
        </Heading>
        {failed && (
          <Text fontSize="sm" color="content.tertiary" mb="4">
            {t("panel.emissions.unavailable")}
          </Text>
        )}
        {!data && !failed && <Spinner size="sm" color="content.link" mb="4" />}
        {data && (
          <Box mb="1">
            {data.sectors.map((s) => {
              const meta = SECTORS[s.code];
              return (
                <Box key={s.code} mb="2.5">
                  <Flex justify="space-between" fontSize="xs" mb="0.5" align="center">
                    <Flex align="center" gap="1.5">
                      {meta && <Icon as={meta.icon} boxSize="4" color={meta.color} />}
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
                  <Box bg="background.neutral" borderRadius="full" h="6px">
                    <Box
                      bg={meta?.color ?? "content.link"}
                      borderRadius="full"
                      h="6px"
                      w={`${Math.max(s.share * 100, 2)}%`}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
        {data && !data.sectors.some((s) => s.code === "III") && (
          <Text fontSize="xs" color="content.tertiary" mb="4">
            {t("panel.emissions.noWaste")}
          </Text>
        )}
        {data && <Box mb="4" />}

        {/* Risks */}
        <Heading size="sm" color="content.secondary" mb="2">
          {t("panel.risks")}{" "}
          <Text as="span" fontWeight="400" color="content.tertiary" fontSize="xs">
            {t("panel.risks.caption")}
          </Text>
        </Heading>
        {data && data.hazards.length > 0 ? (
          <Box mb="4">
            {data.hazards.map((h) => (
              <Box key={h.hazard} mb="2">
                <Flex justify="space-between" fontSize="xs" mb="0.5">
                  <Flex align="center" gap="1.5">
                    {HAZARD_BY_KEY[h.hazard] && (
                      <Icon as={HAZARD_BY_KEY[h.hazard].icon} boxSize="4" color="content.secondary" />
                    )}
                    <Text color="content.primary" fontWeight="500">
                      {HAZARD_BY_KEY[h.hazard] ? t(`hazard.${h.hazard}`) : h.hazard}
                    </Text>
                  </Flex>
                  <Text color="content.tertiary">{(h.score * 100).toFixed(0)}</Text>
                </Flex>
                <Box bg="background.neutral" borderRadius="full" h="6px">
                  <Box
                    bg={h.score >= 0.5 ? "rating.c" : "rating.bplus"}
                    borderRadius="full"
                    h="6px"
                    w={`${Math.max(h.score * 100, 2)}%`}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          data && (
            <Text fontSize="sm" color="content.tertiary" mb="4">
              {t("panel.risks.none")}
            </Text>
          )
        )}

        {/* Recommendation */}
        <Heading size="sm" color="content.secondary" mb="2">
          {t("panel.recommendation")}
        </Heading>
        <Box bg="background.neutral" borderRadius="md" p="3" mb="3">
          <Text fontWeight="700" color="content.alternative" mb="1">
            {t(rec.instrumentKey)}
          </Text>
          {rec.reasoning.map((line, i) => (
            <Text key={i} fontSize="xs" color="content.secondary" mb="0.5">
              • {renderLine(line)}
            </Text>
          ))}
        </Box>
        <Text fontSize="xs" color="content.tertiary">
          {t("panel.disclaimer")}
        </Text>
      </Box>
    </>
  );
}
