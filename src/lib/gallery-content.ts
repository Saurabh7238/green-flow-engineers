import { getDb } from "./mongodb";

export type ManagedGalleryType = "project" | "machinery";
export type LocalizedGalleryText = { en: string; hi: string };

export type ManagedGalleryItem = {
  id: string;
  type: ManagedGalleryType;
  image: string;
  title: LocalizedGalleryText;
  description: LocalizedGalleryText;
  location?: LocalizedGalleryText;
  featured?: boolean;
  createdAt?: Date;
};

const COLLECTION = "gallery_items";

export async function listGalleryItems() {
  const db = await getDb();
  return db.collection<ManagedGalleryItem>(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
}

export async function createGalleryItem(input: Omit<ManagedGalleryItem, "id" | "createdAt">) {
  const item: ManagedGalleryItem = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date(),
  };
  await (await getDb()).collection<ManagedGalleryItem>(COLLECTION).insertOne(item);
  return item;
}

export async function deleteGalleryItem(id: string) {
  await (await getDb()).collection<ManagedGalleryItem>(COLLECTION).deleteOne({ id });
}
