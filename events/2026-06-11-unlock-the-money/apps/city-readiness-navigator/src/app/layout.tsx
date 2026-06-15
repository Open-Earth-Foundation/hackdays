import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Readiness Navigator — CityCatalyst × IDB",
  description:
    "Find which funders your climate plan can reach, see how ready you are for a financing instrument, and submit when ready.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Open+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet (loaded at runtime; map degrades gracefully if offline) */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
