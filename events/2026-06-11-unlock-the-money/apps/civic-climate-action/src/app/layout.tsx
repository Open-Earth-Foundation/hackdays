import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Civic Climate Action — Your City, Your Move",
  description:
    "A citizen-facing companion to CityCatalyst. Discover what your city is doing on climate, learn what it means, and find concrete ways to engage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#0f172a",
          background: "#f8fafc",
        }}
      >
        {children}
      </body>
    </html>
  );
}
