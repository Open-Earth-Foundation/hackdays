import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Readiness Navigator — CityCatalyst × IDB",
  description:
    "Find which funders your climate plan can reach, see how ready you are for the IDB Sub-Sovereign Finance Program, and submit when ready.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Runtime font load (non-blocking; falls back to system sans offline). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Open+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
