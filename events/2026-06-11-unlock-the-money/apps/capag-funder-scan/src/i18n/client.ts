"use client";

// Based on CityCatalyst app/src/i18n/client.ts (i18next + react-i18next). Two deviations,
// both deliberate for a single-route hackday app:
//  1. Static resources instead of resourcesToBackend lazy import — only 2 locales / 1 namespace,
//     so bundling avoids the async-load key flash.
//  2. No LanguageDetector at init — both server and client first-render in `en` for a clean
//     hydration; LanguageToggle applies the stored language in a mount effect (next-themes style).
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getOptions } from "./settings";
import en from "./locales/en/translation.json";
import pt from "./locales/pt/translation.json";

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    ...getOptions(),
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    // our keys are flat dotted strings (e.g. "tier.n.d..label") — don't treat "." / ":" as separators
    keySeparator: false,
    nsSeparator: false,
    // i18next's built-in Intl formatter handles "{{count, number}}" locale-aware
    // (pt-BR 5.566 · en-US 5,566) — no custom format function needed.
    interpolation: { escapeValue: false },
  });
}

export const LNG_STORAGE_KEY = "capag-lng";

export { useTranslation } from "react-i18next";
export { default as i18n } from "i18next";
