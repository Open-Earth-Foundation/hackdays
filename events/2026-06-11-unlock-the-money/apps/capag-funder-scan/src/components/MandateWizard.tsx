"use client";

import { useState } from "react";
import { Box, Button, Flex, Heading, Icon, NativeSelect, Text } from "@chakra-ui/react";
import { MdBolt, MdOutlineAutoAwesome } from "react-icons/md";
import { HAZARDS } from "../lib/display";
import { useTranslation } from "../i18n/client";
import type { InstrumentGroup } from "../lib/instrument";

export type Mandate = {
  instrument: InstrumentGroup | "any";
  uf: string;
  hazards: string[];
};

const INSTRUMENTS: (InstrumentGroup | "any")[] = ["any", "credit", "blended", "grant_ta", "distressed"];

export default function MandateWizard({
  ufs,
  resultCount,
  onApply,
  onClose,
}: {
  ufs: string[];
  resultCount: (m: Mandate) => number;
  onApply: (m: Mandate) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [mandate, setMandate] = useState<Mandate>({ instrument: "any", uf: "", hazards: [] });

  const count = resultCount(mandate);
  const steps = ["instrument", "region", "climate"] as const;
  const last = step === steps.length - 1;

  const toggleHazard = (key: string) =>
    setMandate((m) => ({
      ...m,
      hazards: m.hazards.includes(key) ? m.hazards.filter((h) => h !== key) : [...m.hazards, key],
    }));

  return (
    <>
      <Box position="fixed" inset="0" bg="blackAlpha.500" zIndex="1500" onClick={onClose} />
      <Flex
        position="fixed"
        inset="0"
        zIndex="1600"
        align="center"
        justify="center"
        p="4"
        pointerEvents="none"
      >
        <Box
          w="100%"
          maxW="560px"
          bg="background.default"
          borderRadius="xl"
          p="6"
          pointerEvents="auto"
          boxShadow="0 12px 48px rgba(0,0,31,0.25)"
        >
          <Flex align="center" gap="2" mb="1">
            <Icon as={MdOutlineAutoAwesome} boxSize="5" color="content.alternative" />
            <Heading size="md" color="content.alternative">
              {t("mandate.build")}
            </Heading>
          </Flex>
          <Text fontSize="sm" color="content.tertiary" mb="5">
            {t("mandate.intro")}
          </Text>

          {/* step indicator */}
          <Flex gap="1.5" mb="5">
            {steps.map((s, i) => (
              <Box
                key={s}
                flex="1"
                h="3px"
                borderRadius="full"
                bg={i <= step ? "content.alternative" : "border.neutral"}
              />
            ))}
          </Flex>

          {/* step content */}
          {steps[step] === "instrument" && (
            <Box>
              <Text fontWeight="600" mb="3" color="content.primary">
                {t("mandate.q.instrument")}
              </Text>
              <Flex direction="column" gap="2">
                {INSTRUMENTS.map((inst) => {
                  const active = mandate.instrument === inst;
                  return (
                    <Button
                      key={inst}
                      onClick={() => setMandate((m) => ({ ...m, instrument: inst }))}
                      variant="outline"
                      justifyContent="flex-start"
                      h="auto"
                      py="2.5"
                      px="3"
                      bg={active ? "background.overlay" : "background.default"}
                      borderColor={active ? "content.alternative" : "border.neutral"}
                      borderWidth={active ? "2px" : "1px"}
                    >
                      <Text fontWeight="600" color="content.primary">
                        {t(`instr.${inst}`)}
                      </Text>
                    </Button>
                  );
                })}
              </Flex>
            </Box>
          )}

          {steps[step] === "region" && (
            <Box>
              <Text fontWeight="600" mb="3" color="content.primary">
                {t("mandate.q.region")}
              </Text>
              <NativeSelect.Root bg="background.default">
                <NativeSelect.Field
                  value={mandate.uf}
                  onChange={(e) => setMandate((m) => ({ ...m, uf: e.target.value }))}
                >
                  <option value="">{t("mandate.allBrazil")}</option>
                  {ufs.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Box>
          )}

          {steps[step] === "climate" && (
            <Box>
              <Text fontWeight="600" mb="1" color="content.primary">
                {t("mandate.q.climate")}
              </Text>
              <Text fontSize="xs" color="content.tertiary" mb="3">
                {t("mandate.climateHint")}
              </Text>
              <Flex gap="1.5" wrap="wrap">
                {HAZARDS.map((h) => {
                  const active = mandate.hazards.includes(h.key);
                  return (
                    <Button
                      key={h.key}
                      onClick={() => toggleHazard(h.key)}
                      variant="outline"
                      size="sm"
                      borderRadius="full"
                      fontWeight={active ? "700" : "400"}
                      bg={active ? "content.alternative" : "background.default"}
                      color={active ? "base.light" : "content.secondary"}
                      borderColor={active ? "content.alternative" : "border.neutral"}
                    >
                      <Icon as={h.icon} boxSize="3.5" />
                      {t(`hazard.${h.key}`)}
                    </Button>
                  );
                })}
              </Flex>
            </Box>
          )}

          {/* live result count */}
          <Flex
            align="center"
            gap="2"
            mt="5"
            mb="5"
            bg="background.neutral"
            borderRadius="md"
            px="3"
            py="2.5"
          >
            <Icon as={MdBolt} boxSize="4" color="content.link" />
            <Text fontSize="sm" color="content.secondary">
              {t("mandate.matchCount", { count })}
            </Text>
          </Flex>

          {/* nav */}
          <Flex justify="space-between">
            <Button
              variant="ghost"
              color="content.tertiary"
              onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            >
              {step === 0 ? t("mandate.cancel") : t("mandate.back")}
            </Button>
            {last ? (
              <Button
                bg="content.alternative"
                color="base.light"
                fontWeight="700"
                onClick={() => onApply(mandate)}
              >
                {t("mandate.showPipeline", { count })}
              </Button>
            ) : (
              <Button
                bg="content.alternative"
                color="base.light"
                fontWeight="700"
                onClick={() => setStep(step + 1)}
              >
                {t("mandate.next")}
              </Button>
            )}
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
