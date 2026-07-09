import { getDb } from "./mongodb";
import { serviceKeys, type ServiceKey } from "@/data/services";

export type ServiceSectionItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type ServiceSection = {
  id: string;
  sectionKey?: string;
  label: string;
  items: ServiceSectionItem[];
};

export type ServiceContent = {
  serviceKey: ServiceKey;
  locale: string;
  variant?: string;
  title: string;
  description: string;
  imageUrl?: string;
  items?: ServiceSectionItem[];
  sections?: ServiceSection[];
  updatedAt?: Date;
};

export async function getServiceContent(serviceKey: ServiceKey, locale = "en", variant?: string) {
  const db = await getDb();
  const query: Record<string, any> = { serviceKey, locale };
  if (variant) query.variant = variant;
  return db.collection<ServiceContent>("service_content").findOne(query);
}

export async function getAllServiceContent(locale = "en") {
  const db = await getDb();
  return db.collection<ServiceContent>("service_content").find({ locale }).toArray();
}

export async function upsertServiceContent(content: ServiceContent) {
  const db = await getDb();
  const query: Record<string, any> = { serviceKey: content.serviceKey, locale: content.locale };
  if (content.variant) query.variant = content.variant;
  await db.collection("service_content").updateOne(
    query,
    { $set: { ...content, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function deleteServiceContent(serviceKey: ServiceKey, locale = "en", variant?: string) {
  const db = await getDb();
  const query: Record<string, any> = { serviceKey, locale };
  if (variant) query.variant = variant;
  await db.collection("service_content").deleteOne(query);
}
