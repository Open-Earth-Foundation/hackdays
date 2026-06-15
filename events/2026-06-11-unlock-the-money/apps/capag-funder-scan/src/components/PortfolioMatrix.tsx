"use client";

import { useMemo } from "react";
import { Box, Flex, Grid, Heading, Icon, Text } from "@chakra-ui/react";
import { MdVisibilityOff } from "react-icons/md";
import { instrumentGroup, type InstrumentGroup } from "../lib/instrument";
import { riskBand, RISK_BANDS, type RiskBand } from "../lib/risk";
import { fmtBrl } from "../lib/headroom";
import { useTranslation } from "../i18n/client";
import type { Row } from "./Explorer";

const GROUPS: InstrumentGroup[] = ["credit", "blended", "grant_ta", "distressed"];

// soft tier tints (CC rating palette, low-opacity backgrounds)
const GROUP_BG: Record<InstrumentGroup, string> = {
  credit: "rgba(45,208,91,0.14)",
  blended: "rgba(242,140,55,0.16)",
  grant_ta: "rgba(122,123,154,0.14)",
  distressed: "rgba(223,34,34,0.14)",
};
const GROUP_FG: Record<InstrumentGroup, string> = {
  credit: "rating.aplus",
  blended: "rating.c",
  grant_ta: "content.tertiary",
  distressed: "rating.d",
};

type Cell = { count: number; unlock: number };

export default function PortfolioMatrix({
  rows,
  onCell,
}: {
  rows: Row[];
  onCell: (group: InstrumentGroup, band: RiskBand) => void;
}) {
  const { t } = useTranslation();

  const { grid, totals } = useMemo(() => {
    const g: Record<string, Cell> = {};
    const tot: Record<InstrumentGroup, Cell> = {
      credit: { count: 0, unlock: 0 },
      blended: { count: 0, unlock: 0 },
      grant_ta: { count: 0, unlock: 0 },
      distressed: { count: 0, unlock: 0 },
    };
    for (const r of rows) {
      const band = riskBand(r.risks);
      if (!band) continue;
      const grp = instrumentGroup(r.capag);
      const key = `${grp}|${band}`;
      (g[key] ??= { count: 0, unlock: 0 });
      g[key].count++;
      g[key].unlock += r.unlockBrl;
      tot[grp].count++;
      tot[grp].unlock += r.unlockBrl;
    }
    return { grid: g, totals: tot };
  }, [rows]);

  // the "invisible market": credit-blocked or unrated cities at moderate/high climate risk
  const isInvisible = (grp: InstrumentGroup, band: RiskBand) =>
    (grp === "blended" || grp === "grant_ta") && band !== "low";

  return (
    <Box>
      <Heading size="md" color="content.alternative" mb="1">
        {t("portfolio.title")}
      </Heading>
      <Text fontSize="sm" color="content.tertiary" mb="5" maxW="46rem">
        {t("portfolio.intro")}
      </Text>

      <Grid templateColumns="200px repeat(3, 1fr)" gap="2" maxW="5xl">
        {/* header row */}
        <Box />
        {RISK_BANDS.map((band) => (
          <Text
            key={band}
            fontSize="xs"
            fontWeight="700"
            color="content.secondary"
            textAlign="center"
            textTransform="uppercase"
            letterSpacing="wide"
            pb="1"
          >
            {t(`portfolio.band.${band}`)}
          </Text>
        ))}

        {/* rows */}
        {GROUPS.map((grp) => (
          <Box key={grp} display="contents">
            <Flex direction="column" justify="center" py="2">
              <Text fontWeight="700" fontSize="sm" color={GROUP_FG[grp]}>
                {t(`portfolio.group.${grp}`)}
              </Text>
              <Text fontSize="2xs" color="content.tertiary">
                {totals[grp].count.toLocaleString()} · {fmtBrl(totals[grp].unlock)}
              </Text>
            </Flex>
            {RISK_BANDS.map((band) => {
              const cell = grid[`${grp}|${band}`] ?? { count: 0, unlock: 0 };
              const invisible = isInvisible(grp, band);
              return (
                <Box
                  key={band}
                  as="button"
                  onClick={() => onCell(grp, band)}
                  textAlign="left"
                  bg={GROUP_BG[grp]}
                  borderRadius="md"
                  borderWidth={invisible ? "2px" : "1px"}
                  borderColor={invisible ? "content.link" : "border.neutral"}
                  p="3"
                  cursor="pointer"
                  transition="transform 0.08s"
                  _hover={{ transform: "translateY(-2px)", borderColor: "content.alternative" }}
                >
                  <Text fontSize="xl" fontWeight="700" fontFamily="heading" color={GROUP_FG[grp]}>
                    {cell.count.toLocaleString()}
                  </Text>
                  {cell.unlock > 0 && (
                    <Text fontSize="xs" color="content.secondary">
                      {fmtBrl(cell.unlock)}
                    </Text>
                  )}
                  {invisible && cell.count > 0 && (
                    <Flex align="center" gap="1" mt="1.5" color="content.link" fontSize="2xs" fontWeight="600">
                      <Icon as={MdVisibilityOff} boxSize="3" />
                      {t("portfolio.cantSee")}
                    </Flex>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Grid>

      <Text fontSize="xs" color="content.tertiary" mt="4" maxW="46rem">
        {t("portfolio.note")}
      </Text>
    </Box>
  );
}
