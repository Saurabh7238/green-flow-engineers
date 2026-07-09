import { getDb } from "@/lib/mongodb";

export type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  introTitle?: string;
  introText?: string;
  aboutVision?: string;
  aboutMission?: string;
  contactAddress?: string;
  phone?: string;
  email?: string;
};

export async function getSiteContent(): Promise<SiteContent> {
  const db = await getDb();
  const content = await db.collection("site_content").findOne({ key: "siteContent" });
  return (content?.data ?? {}) as SiteContent;
}
