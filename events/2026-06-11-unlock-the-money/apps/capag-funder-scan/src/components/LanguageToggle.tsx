"use client";

import { useEffect, useState } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { i18n, LNG_STORAGE_KEY, useTranslation } from "../i18n/client";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

export default function LanguageToggle() {
  const { i18n: inst } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // apply stored language after mount (SSR + first paint stay on `en` to avoid hydration mismatch)
  useEffect(() => {
    const stored = window.localStorage.getItem(LNG_STORAGE_KEY);
    if (stored && stored !== inst.resolvedLanguage) i18n.changeLanguage(stored);
    setMounted(true);
  }, [inst.resolvedLanguage]);

  const current = mounted ? inst.resolvedLanguage : "en";

  const set = (code: string) => {
    i18n.changeLanguage(code);
    window.localStorage.setItem(LNG_STORAGE_KEY, code);
  };

  return (
    <Flex
      borderWidth="1px"
      borderColor="background.overlay"
      borderRadius="full"
      overflow="hidden"
    >
      {LANGS.map((l) => {
        const active = current === l.code;
        return (
          <Button
            key={l.code}
            onClick={() => set(l.code)}
            size="xs"
            borderRadius="0"
            fontWeight="700"
            px="3"
            bg={active ? "base.light" : "transparent"}
            color={active ? "content.alternative" : "base.light"}
            _hover={{ bg: active ? "base.light" : "whiteAlpha.300" }}
          >
            {l.label}
          </Button>
        );
      })}
    </Flex>
  );
}
