"use client";

import { useState } from "react";
import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  MdAccountBalance,
  MdArrowBack,
  MdArrowForward,
  MdAutoAwesome,
  MdBolt,
  MdLockOpen,
  MdPublic,
} from "react-icons/md";
import { useTranslation } from "../i18n/client";

type Slide = {
  key: string;
  icon: IconType;
  blobs: [string, string, string]; // aurora colors
};

const SLIDES: Slide[] = [
  { key: "intro", icon: MdPublic, blobs: ["#2351DC", "#5785F4", "#001EA7"] },
  { key: "capag", icon: MdAccountBalance, blobs: ["#2351DC", "#2DD05B", "#5785F4"] },
  { key: "graduation", icon: MdBolt, blobs: ["#2DD05B", "#C6C61D", "#739F19"] },
  { key: "gates", icon: MdLockOpen, blobs: ["#F28C37", "#2351DC", "#8E7109"] },
  { key: "use", icon: MdAutoAwesome, blobs: ["#5785F4", "#001EA7", "#2351DC"] },
];

export default function OnboardingCarousel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <>
      <style>{`
        @keyframes capagFloatA { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(40px,30px) scale(1.25)} }
        @keyframes capagFloatB { 0%{transform:translate(0,0) scale(1.1)} 100%{transform:translate(-50px,20px) scale(0.9)} }
        @keyframes capagFloatC { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,-40px) scale(1.2)} }
      `}</style>
      <Box position="fixed" inset="0" bg="blackAlpha.600" zIndex="1700" onClick={onClose} />
      <Flex position="fixed" inset="0" zIndex="1701" align="center" justify="center" p="4" pointerEvents="none">
        <Box
          w="100%"
          maxW="620px"
          borderRadius="2xl"
          overflow="hidden"
          pointerEvents="auto"
          boxShadow="0 24px 64px rgba(0,0,31,0.45)"
          bg="#070b24"
          position="relative"
        >
          {/* aurora */}
          <Box position="absolute" inset="0" overflow="hidden">
            {s.blobs.map((c, bi) => (
              <Box
                key={`${i}-${bi}`}
                position="absolute"
                w="60%"
                h="70%"
                borderRadius="full"
                bg={c}
                filter="blur(60px)"
                opacity="0.55"
                top={bi === 0 ? "-10%" : bi === 1 ? "30%" : "50%"}
                left={bi === 0 ? "-5%" : bi === 1 ? "55%" : "20%"}
                style={{
                  animation: `capagFloat${["A", "B", "C"][bi]} ${9 + bi * 2}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </Box>

          {/* content */}
          <Flex position="relative" direction="column" minH="440px" p="8" color="white">
            <Flex justify="space-between" align="center" mb="6">
              <Flex
                align="center"
                justify="center"
                w="12"
                h="12"
                borderRadius="xl"
                bg="whiteAlpha.200"
                borderWidth="1px"
                borderColor="whiteAlpha.300"
              >
                <Icon as={s.icon} boxSize="6" color="white" />
              </Flex>
              <Box
                as="button"
                onClick={onClose}
                color="whiteAlpha.700"
                fontSize="sm"
                _hover={{ color: "white" }}
              >
                {t("intro.skip")}
              </Box>
            </Flex>

            <Text fontSize="xs" fontWeight="700" letterSpacing="widest" textTransform="uppercase" color="whiteAlpha.700" mb="2">
              {t(`intro.${s.key}.kicker`)}
            </Text>
            <Heading size="xl" fontFamily="heading" mb="4" lineHeight="1.2">
              {t(`intro.${s.key}.title`)}
            </Heading>
            <Text fontSize="md" color="whiteAlpha.900" lineHeight="1.7" maxW="30rem">
              {t(`intro.${s.key}.body`)}
            </Text>

            <Box flex="1" />

            <Flex align="center" justify="space-between" mt="8">
              {/* dots */}
              <Flex gap="2">
                {SLIDES.map((sl, di) => (
                  <Box
                    key={sl.key}
                    as="button"
                    onClick={() => setI(di)}
                    w={di === i ? "7" : "2.5"}
                    h="2.5"
                    borderRadius="full"
                    bg={di === i ? "white" : "whiteAlpha.400"}
                    transition="all 0.2s"
                  />
                ))}
              </Flex>
              <Flex gap="2">
                {i > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.400"
                    bg="whiteAlpha.100"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={() => setI(i - 1)}
                  >
                    <Icon as={MdArrowBack} boxSize="4" />
                    {t("intro.back")}
                  </Button>
                )}
                <Button
                  size="sm"
                  bg="white"
                  color="content.alternative"
                  fontWeight="700"
                  _hover={{ bg: "whiteAlpha.800" }}
                  onClick={() => (last ? onClose() : setI(i + 1))}
                >
                  {last ? t("intro.done") : t("intro.next")}
                  {!last && <Icon as={MdArrowForward} boxSize="4" />}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
