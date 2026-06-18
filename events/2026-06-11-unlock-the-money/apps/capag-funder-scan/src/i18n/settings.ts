// Mirrors CityCatalyst app/src/i18n/settings.ts (trimmed to the two languages this app ships)
export const fallbackLng = "en";
export const languages = [fallbackLng, "pt"];
export const defaultNS = "translation";

export function getOptions(lng: string = fallbackLng, ns: string = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
