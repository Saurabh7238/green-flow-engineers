import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#organization`,
        name: "Green Flow Engineers",
        url: siteUrl,
        logo: `${siteUrl}/images/green-flow-logo.png`,
        image: `${siteUrl}/images/green-flow-logo.png`,
        email: siteConfig.email,
        telephone: siteConfig.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "PVT Plot No. 42, Colony 2, Sahkar",
          addressLocality: "Kanpur",
          addressRegion: "Uttar Pradesh",
          postalCode: "200817",
          addressCountry: "IN",
        },
        areaServed: { "@type": "Country", name: "India" },
        knowsAbout: siteConfig.keywords,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Green Flow Engineers",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
