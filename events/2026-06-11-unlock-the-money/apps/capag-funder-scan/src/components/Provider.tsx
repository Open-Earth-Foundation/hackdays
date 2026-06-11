"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { appTheme } from "../lib/theme";

export function Provider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={appTheme}>{children}</ChakraProvider>;
}
