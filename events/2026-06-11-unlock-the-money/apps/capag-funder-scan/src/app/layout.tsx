import { Open_Sans, Poppins } from "next/font/google";
import { Provider } from "../components/Provider";

// same font pairing as CityCatalyst (Poppins headings, Open Sans body)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-opensans" });

export const metadata = {
  title: "CAPAG Funder Scan",
  description:
    "Brazilian municipal fiscal capacity (CAPAG) joined to CityCatalyst climate data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`} suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
