import { getDb } from "./mongodb";
import { serviceKeys, type ServiceKey } from "@/data/services";

export type MediaType = "image" | "video";

export type ServiceContentItem = {
  id: string;
  vertical_tab: ServiceKey;
  subtype: string;
  title: string;
  description_short: string;
  description_detailed?: string;
  media_type: MediaType;
  media_url: string;
  action_link: string;
};

export type ServiceSectionItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  alt?: string;
  subtype?: string;
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
  items?: ServiceContentItem[];
  sections?: ServiceSection[];
  updatedAt?: Date;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const SLOT_VARIANT_MAP: Record<ServiceKey, Record<string, string>> = {
  water: {
    "Water Treatment Plant (WTP)": "water-treatment-plant",
    "Sewage Treatment Plant (STP)": "sewage-treatment-plant",
    "Effluent Treatment Plant (ETP)": "effluent-treatment-plant",
    "Industrial RO System": "industrial-ro-system",
  },
  racks: {
    "Pallet Rack / Heavy Duty Rack": "pallet-rack-heavy-duty-rack",
    "Cantilever Rack": "cantilever-rack",
    "FIFO Flow Rack (Gravity Flow)": "fifo-flow-rack-gravity-flow",
    "Mezzanine Floor / Multi-Tier System": "mezzanine-floor-multi-tier-system",
    "Long Span Rack / Medium Duty Rack": "long-span-rack-medium-duty-rack",
    "Slotted Angle Rack": "slotted-angle-rack",
    "Supermarket Rack / Display Rack": "supermarket-rack-display-rack",
    "Mobile Compacter": "mobile-compacter",
  },
  hvac: {
    "Industrial Humidification Plant": "industrial-humidification-plant",
    "Air Handling Unit (AHU)": "air-handling-unit-ahu",
    "Complete HVAC System": "complete-hvac-system",
    "Ventilation & Exhaust System": "ventilation-exhaust-system",
  },
  textile: {
    "Spinning Unit Equipment": "spinning-unit-equipment",
    "Weaving Machinery / Looms": "weaving-machinery-looms",
    "Processing & Finishing Units": "processing-finishing-units",
  },
  fire: {
    "Fire Detection & Alarm Systems (Addressable/VESDA)": "fire-detection-alarm-systems-addressable-vesda",
    "Water-Based Suppression (Hydrants/Sprinklers)": "water-based-suppression-hydrants-sprinklers",
    "Gas-Based Clean Agent Suppression (CO2/FM-200/Novec)": "gas-based-clean-agent-suppression-co2-fm-200-novec",
    "Foam/Passive Fireproofing & Containment": "foam-passive-fireproofing-containment",
  },
  lighting: {
    "Industrial Factory Floor / High Bay Lighting": "industrial-factory-floor-high-bay-lighting",
    "Commercial Office Recessed & Linear Lighting": "commercial-office-recessed-linear-lighting",
    "Explosion-Proof / Hazardous Zone Lighting": "explosion-proof-hazardous-zone-lighting",
    "Intelligent Lighting Control Systems (DALI)": "intelligent-lighting-control-systems-dali",
  },
};

export function getSlotVariant(serviceKey: ServiceKey, subtype: string) {
  return SLOT_VARIANT_MAP[serviceKey]?.[subtype] || slugify(subtype);
}

export function normalizeServiceContent(content: ServiceContent | null): ServiceContent | null {
  if (!content) return null;
  if ((!content.items || content.items.length === 0) && content.sections?.length) {
    content.items = content.sections.flatMap((section) =>
      section.items.map((item) => ({
        id: item.id,
        vertical_tab: content.serviceKey,
        subtype: section.label || item.subtype || "",
        title: item.title,
        description_short: item.description || "",
        description_detailed: "",
        media_type: "image" as MediaType,
        media_url: item.imageUrl || "",
        action_link: "#",
      })),
    );
  }
  return content;
}

export function sanitizeServiceContentItem(
  item: Partial<ServiceContentItem>,
  defaultServiceKey: ServiceKey,
  defaultSubtype: string,
): ServiceContentItem {
  return {
    id: item.id?.toString() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    vertical_tab: serviceKeys.includes(item.vertical_tab as ServiceKey)
      ? (item.vertical_tab as ServiceKey)
      : defaultServiceKey,
    subtype: item.subtype?.toString().trim() || defaultSubtype,
    title: item.title?.toString().trim() || "",
    description_short: item.description_short?.toString().trim() || "",
    description_detailed: item.description_detailed?.toString().trim() || "",
    media_type: item.media_type === "video" ? "video" : "image",
    media_url: item.media_url?.toString().trim() || "",
    action_link: item.action_link?.toString().trim() || "#",
  };
}

export async function getServiceContent(serviceKey: ServiceKey, locale = "en", variant?: string) {
  const db = await getDb();
  const collection = db.collection<ServiceContent>("service_content");

  if (variant) {
    const exactMatch = await collection.findOne({ serviceKey, locale, variant });
    return normalizeServiceContent(exactMatch);
  }

  const fallbackMatch = await collection.findOne({ serviceKey, locale });
  return normalizeServiceContent(fallbackMatch);
}

export async function getAllServiceContent(locale = "en") {
  const db = await getDb();
  const contents = await db.collection<ServiceContent>("service_content").find({ locale }).toArray();
  return contents.map(normalizeServiceContent).filter((content): content is NonNullable<typeof content> => content !== null);
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

export async function deleteServiceContentItem(
  serviceKey: ServiceKey,
  locale = "en",
  variant: string | undefined,
  itemId: string,
) {
  const db = await getDb();
  const query: Record<string, any> = { serviceKey, locale };
  if (variant) query.variant = variant;
  await db.collection<ServiceContent>("service_content").updateOne(
    query,
    { $pull: { items: { id: itemId } }, $set: { updatedAt: new Date() } },
  );
}
