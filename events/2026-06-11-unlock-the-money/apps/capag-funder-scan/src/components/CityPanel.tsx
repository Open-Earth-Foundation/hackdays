"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { recommend } from "../lib/recommend";
import type { Row } from "./Explorer";

type CityData = {
  year: number;
  total: number;
  sectors: { code: string; name: string; co2eq: number; share: number }[];
  hazards: { hazard: string; score: number }[];
};

const INDICATOR_HELP: { key: "debt" | "savings" | "liquidity"; name: string; what: string }[] = [
  {
    key: "debt",
    name: "Debt (Endividamento)",
    what: "Gross consolidated debt ÷ net current revenue. How leveraged the city already is.",
  },
  {
    key: "savings",
    name: "Savings (Poupança Corrente)",
    what: "Current expenses ÷ current revenues, 3-year weighted average. Whether day-to-day operations leave room to invest.",
  },
  {
    key: "liquidity",
    name: "Liquidity (Liquidez Relativa)",
    what: "(Cash − short-term obligations) ÷ net current revenue. Whether the city can pay what's due now.",
  },
];

const HAZARD_LABELS: Record<string, string> = {
  heatwaves: "Heatwaves",
  floods: "Floods",
  droughts: "Droughts",
  landslides: "Landslides",
  diseases: "Diseases",
  "sea-level-rise": "Sea level rise",
};

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
          Fiscal capacity — CAPAG <Badge bg="content.link" color="base.light">{row.capag}</Badge>
        </Heading>
        <Box borderWidth="1px" borderColor="border.neutral" borderRadius="md" p="3" mb="1">
          {INDICATOR_HELP.map((ind) => (
            <Flex key={ind.key} gap="2" align="start" mb="2.5" _last={{ mb: 0 }}>
              <GradePill grade={row[ind.key]} />
              <Box>
                <Text fontSize="sm" fontWeight="600" color="content.primary">
                  {ind.name}
                </Text>
                <Text fontSize="xs" color="content.tertiary">
                  {ind.what}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
        <Text fontSize="xs" color="content.tertiary" mb="4">
          ICF (accounting quality): <b>{row.icf}</b> — Aicf entities get the “+” upgrade; Dicf/Eicf are
          ineligible for federal guarantees regardless of indicators.
        </Text>

        {/* Emissions */}
        <Heading size="sm" color="content.secondary" mb="2">
          Emissions by sector{" "}
          {data && (
            <Text as="span" fontWeight="400" color="content.tertiary" fontSize="xs">
              SEEG {data.year} · total {fmtMt(data.total)} CO₂e
            </Text>
          )}
        </Heading>
        {failed && (
          <Text fontSize="sm" color="content.tertiary" mb="4">
            CityCatalyst API unavailable right now.
          </Text>
        )}
        {!data && !failed && <Spinner size="sm" color="content.link" mb="4" />}
        {data && (
          <Box mb="1">
            {data.sectors.map((s) => (
              <Box key={s.code} mb="2">
                <Flex justify="space-between" fontSize="xs" mb="0.5">
                  <Text color="content.primary" fontWeight="500">
                    {s.name}
                  </Text>
                  <Text color="content.tertiary">
                    {fmtMt(s.co2eq)} · {(s.share * 100).toFixed(0)}%
                  </Text>
                </Flex>
                <Box bg="background.neutral" borderRadius="full" h="6px">
                  <Box bg="content.link" borderRadius="full" h="6px" w={`${Math.max(s.share * 100, 2)}%`} />
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {data && (
          <Text fontSize="xs" color="content.tertiary" mb="4">
            Waste (GPC III) not covered by SEEG.
          </Text>
        )}

        {/* Risks */}
        <Heading size="sm" color="content.secondary" mb="2">
          Climate risks{" "}
          <Text as="span" fontWeight="400" color="content.tertiary" fontSize="xs">
            CCRA, current scenario, normalized 0–100
          </Text>
        </Heading>
        {data && data.hazards.length > 0 ? (
          <Box mb="4">
            {data.hazards.map((h) => (
              <Box key={h.hazard} mb="2">
                <Flex justify="space-between" fontSize="xs" mb="0.5">
                  <Text color="content.primary" fontWeight="500">
                    {HAZARD_LABELS[h.hazard] ?? h.hazard}
                  </Text>
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
              No CCRA data for this city.
            </Text>
          )
        )}

        {/* Recommendation */}
        <Heading size="sm" color="content.secondary" mb="2">
          Suggested instrument
        </Heading>
        <Box bg="background.neutral" borderRadius="md" p="3" mb="3">
          <Text fontWeight="700" color="content.alternative" mb="1">
            {rec.instrument}
          </Text>
          {rec.reasoning.map((r, i) => (
            <Text key={i} fontSize="xs" color="content.secondary" mb="0.5">
              • {r}
            </Text>
          ))}
        </Box>
        <Text fontSize="xs" color="content.tertiary">
          CAPAG is an indicative screening signal published by the Treasury; the binding rating is
          computed only when a credit operation is requested. This is prioritization support, not a
          credit decision.
        </Text>
      </Box>
    </>
  );
}
