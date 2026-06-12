import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "CityCatalyst — Political Will Score",
  description: "HIAP action confidence with political will checks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
