import { getDb } from "./mongodb";
import { serviceKeys, type ServiceKey } from "@/data/services";

export type ServiceSectionItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type ServiceSection = {
  sectionKey: string;
  label: string;
  items: ServiceSectionItem[];
};

export type ServiceContent = {
  serviceKey: ServiceKey;
  locale: string;
  title: string;
  description: string;
  imageUrl?: string;
  items?: ServiceSectionItem[];
  sections?: ServiceSection[];
  updatedAt?: Date;
};

export async function getServiceContent(serviceKey: ServiceKey, locale = "en") {
  const db = await getDb();
  return db.collection<ServiceContent>("service_content").findOne({ serviceKey, locale });
}

export async function getAllServiceContent(locale = "en") {
  const db = await getDb();
  return db.collection<ServiceContent>("service_content").find({ locale }).toArray();
}

export async function upsertServiceContent(content: ServiceContent) {
  const db = await getDb();
  await db.collection("service_content").updateOne(
    { serviceKey: content.serviceKey, locale: content.locale },
    { $set: { ...content, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function deleteServiceContent(serviceKey: ServiceKey, locale = "en") {
  const db = await getDb();
  await db.collection("service_content").deleteOne({ serviceKey, locale });
}
