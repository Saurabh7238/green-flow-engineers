import { getDb } from "./mongodb";

export type MediaType = "image" | "video";

export type SliderItem = {
  id: string;
  mediaId: string; // external id or generated id
  sequence: number;
  mediaType: MediaType;
  assetUrl: string;
  headline?: string;
  actionLink?: string;
  // injected layout metadata
  boundaryClass?: string;
  aspect?: string; // e.g. "16:9"
  createdAt?: Date;
  updatedAt?: Date;
};

const SLIDER_COLLECTION = "media_sliders";

function normalizeAssetMetadata(item: Partial<SliderItem>): Partial<SliderItem> {
  const out: Partial<SliderItem> = { ...item };
  // Force aspect ratio metadata
  out.aspect = "16:9";

  if (item.mediaType === "image") {
    out.boundaryClass = "w-full h-full object-cover object-center pointer-events-none";
  } else if (item.mediaType === "video") {
    out.boundaryClass = "w-full h-full object-cover absolute inset-0 z-0";
    // if external provider, ensure autoplay/mute/loop hints are present in url query
    if (typeof item.assetUrl === "string" && /youtube|youtu.be|vimeo/i.test(item.assetUrl)) {
      // append query params safely if missing
      const url = new URL(item.assetUrl, "http://localhost");
      const params = url.searchParams;
      if (!params.has("autoplay")) params.set("autoplay", "1");
      if (!params.has("mute") && !params.has("muted")) params.set("mute", "1");
      if (!params.has("loop")) params.set("loop", "1");
      out.assetUrl = url.toString().replace("http://localhost", "");
    }
  }

  return out;
}

export async function listSlider(sliderName = "HOMEPAGE_HERO_SLIDER") {
  const db = await getDb();
  const docs = await db
    .collection<SliderItem>(SLIDER_COLLECTION)
    .find({ sliderName })
    .sort({ sequence: 1 })
    .toArray();
  return docs;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function addSlide(sliderName: string, payload: Partial<SliderItem>) {
  const db = await getDb();
  const collection = db.collection(SLIDER_COLLECTION);
  const max = await collection.find({ sliderName }).sort({ sequence: -1 }).limit(1).next();
  const nextSeq = max && typeof max.sequence === "number" ? max.sequence + 1 : 1;

  const item: SliderItem = {
    id: payload.id || makeId(),
    mediaId: payload.mediaId || makeId(),
    sequence: payload.sequence ?? nextSeq,
    mediaType: (payload.mediaType as MediaType) || "image",
    assetUrl: payload.assetUrl || "",
    headline: payload.headline || "",
    actionLink: payload.actionLink || "",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...normalizeAssetMetadata(payload),
  };

  await collection.insertOne({ sliderName, ...item });
  await reindex(sliderName);
  return item;
}

export async function updateSlide(sliderName: string, id: string, updates: Partial<SliderItem>) {
  const db = await getDb();
  const collection = db.collection(SLIDER_COLLECTION);
  const existing = await collection.findOne({ sliderName, id });
  if (!existing) throw new Error("Slide not found");

  const normalized = normalizeAssetMetadata({ ...existing, ...updates });
  const toSet: any = { ...updates, ...normalized, updatedAt: new Date() };
  await collection.updateOne({ sliderName, id }, { $set: toSet });

  // handle re-sequencing if sequence changed
  if (typeof updates.sequence === "number") {
    await reindex(sliderName);
  }
  return await collection.findOne({ sliderName, id });
}

export async function deleteSlide(sliderName: string, id: string) {
  const db = await getDb();
  const collection = db.collection(SLIDER_COLLECTION);
  await collection.deleteOne({ sliderName, id });
  await reindex(sliderName);
}

export async function reindex(sliderName: string) {
  const db = await getDb();
  const collection = db.collection(SLIDER_COLLECTION);
  const docs = await collection.find({ sliderName }).sort({ sequence: 1 }).toArray();
  let i = 1;
  const bulk = collection.initializeUnorderedBulkOp();
  for (const d of docs) {
    if (d.sequence !== i) {
      bulk.find({ sliderName, id: d.id }).updateOne({ $set: { sequence: i } });
    }
    i++;
  }
  if (bulk.length > 0) await bulk.execute();
}
