import type { Metadata } from "next";
import "./globals.css";
import { CarbonProvider } from "./lib/carbonContext";
import CarbonCounter from "./components/CarbonCounter";

export const metadata: Metadata = {
  title: "Civic Climate Action — Your City, Your Move",
  description:
    "A citizen-facing companion to CityCatalyst. Discover what your city is doing on climate, learn what it means, and find concrete ways to engage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CarbonProvider>
          {children}
          <CarbonCounter />
        </CarbonProvider>
      </body>
    </html>
  );
}
