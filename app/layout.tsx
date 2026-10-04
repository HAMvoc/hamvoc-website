import type { Metadata, Viewport } from "next";
import { Barlow, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description.join(" "),
  openGraph: {
    siteName: site.name,
    title: site.name,
    description: site.description.join(" "),
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#111217",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${beVietnamPro.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
