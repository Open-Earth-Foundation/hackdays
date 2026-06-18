import { createSystem, defaultConfig } from "@chakra-ui/react";

// Trimmed-down CityCatalyst theme (blue_theme values from
// CityCatalyst app/src/lib/theme/recipes/app-theme.ts)
export const appTheme = createSystem(defaultConfig, {
  globalCss: {
    body: {
      bg: "background.neutral",
      color: "content.primary",
    },
  },
  theme: {
    tokens: {
      colors: {
        base: {
          light: { value: "#FFFFFF" },
          dark: { value: "#00001F" },
        },
        content: {
          alternative: { value: "#001EA7" },
          link: { value: "#2351DC" },
          tertiary: { value: "#7A7B9A" },
          secondary: { value: "#232640" },
          primary: { value: "#00001F" },
        },
        background: {
          default: { value: "#FFFFFF" },
          neutral: { value: "#E8EAFB" },
          overlay: { value: "#C5CBF5" },
        },
        interactive: {
          secondary: { value: "#2351DC" },
        },
        border: {
          neutral: { value: "#D7D8FA" },
          overlay: { value: "#E6E7FF" },
        },
        // GPC sector colors (CC custom-colors.ts SectorColors)
        sector: {
          I: { value: "#5785F4" },
          II: { value: "#DF2222" },
          III: { value: "#F28C37" },
          IV: { value: "#2DD05B" },
          V: { value: "#C6C61D" },
        },
        // sentiment colors for CAPAG tiers (CC sector-style palette)
        rating: {
          aplus: { value: "#0E5221" },
          a: { value: "#2DD05B" },
          bplus: { value: "#739F19" },
          b: { value: "#C6C61D" },
          c: { value: "#F28C37" },
          d: { value: "#DF2222" },
          nd: { value: "#7A7B9A" },
          ne: { value: "#C5CBF5" },
        },
      },
      fonts: {
        heading: { value: "var(--font-poppins)" },
        body: { value: "var(--font-opensans)" },
      },
    },
  },
});
