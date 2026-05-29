import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://greenflowengineers.vercel.app"),
  title: {
    default: "Green Flow Engineers | Sustainable Industrial Solutions",
    template: "%s | Green Flow Engineers",
  },
  description:
    "WTP, STP, ETP, RO plants, HVAC, textile machinery, fire fighting systems, and industrial lighting — supply, installation & commissioning in Kanpur, India.",
  keywords: siteConfig.keywords,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Green Flow Engineers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
