import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CarbonProvider } from "./lib/carbonContext";
import { PledgeProvider } from "./lib/pledgeContext";
import CarbonCounter from "./components/CarbonCounter";

export const metadata: Metadata = {
  title: "Civic Climate Action — Your City, Your Move",
  description:
    "A citizen-facing companion to CityCatalyst. See what your city is up against on climate, and get one real thing you can do about it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CarbonProvider>
          <PledgeProvider>
            <nav style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 500 }}>
              <div
                className="wrap"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}
              >
                <Link href="/" style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem" }}>
                  Civic Climate Action
                </Link>
                <div style={{ display: "flex", gap: "1.4rem", alignItems: "center" }}>
                  <Link href="/stories" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Stories
                  </Link>
                  <Link href="/funders" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    For funders
                  </Link>
                </div>
              </div>
            </nav>
            {children}
            <CarbonCounter />
          </PledgeProvider>
        </CarbonProvider>
      </body>
    </html>
  );
}
