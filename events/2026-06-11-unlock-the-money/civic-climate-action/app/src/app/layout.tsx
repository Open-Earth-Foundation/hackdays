import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Climate Action — Your City, Your Move",
  description:
    "A citizen-facing companion to CityCatalyst. Discover what your city is doing on climate, learn what it means, and find concrete ways to engage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
