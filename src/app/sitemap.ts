import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { siteUrl } from "@/lib/site-url";

const locales = ["en", "hi"] as const;
const staticPages = ["", "/services", "/gallery", "/blog", "/about", "/contact", "/enquiry"];
const serviceDetailPages = [
  ["water", "water-treatment-plant"], ["water", "sewage-treatment-plant"], ["water", "effluent-treatment-plant"], ["water", "industrial-ro-system"],
  ["racks", "pallet-rack-heavy-duty-rack"], ["racks", "cantilever-rack"], ["racks", "fifo-flow-rack-gravity-flow"], ["racks", "mezzanine-floor-multi-tier-system"], ["racks", "long-span-rack-medium-duty-rack"], ["racks", "slotted-angle-rack"], ["racks", "supermarket-rack-display-rack"], ["racks", "mobile-compacter"],
  ["hvac", "industrial-humidification-plant"], ["hvac", "air-handling-unit-ahu"], ["hvac", "complete-hvac-system"], ["hvac", "ventilation-exhaust-system"],
  ["textile", "spinning-unit-equipment"], ["textile", "weaving-machinery-looms"], ["textile", "processing-finishing-units"],
  ["fire", "fire-detection-alarm-systems-addressable-vesda"], ["fire", "water-based-suppression-hydrants-sprinklers"], ["fire", "gas-based-clean-agent-suppression-co2-fm-200-novec"], ["fire", "foam-passive-fireproofing-containment"],
  ["lighting", "industrial-factory-floor-high-bay-lighting"], ["lighting", "commercial-office-recessed-linear-lighting"], ["lighting", "explosion-proof-hazardous-zone-lighting"], ["lighting", "intelligent-lighting-control-systems-dali"],
] as const;

const languageAlternates = (path: string) => ({
  languages: Object.fromEntries(locales.map((locale) => [locale === "hi" ? "hi-IN" : "en-IN", `${siteUrl}/${locale}${path}`])),
});

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${siteUrl}/${locale}${page}`,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.8,
        alternates: languageAlternates(page),
      });
    }

    for (const [serviceKey, slug] of serviceDetailPages) {
      const path = `/services/${serviceKey}/${slug}`;
      entries.push({ url: `${siteUrl}/${locale}${path}`, changeFrequency: "monthly", priority: 0.8, alternates: languageAlternates(path) });
    }

    for (const post of blogPosts) {
      const path = `/blog/${post.slug}`;
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: languageAlternates(path),
      });
    }
  }

  return entries;
}
