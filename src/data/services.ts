export const serviceKeys = [
  "water",
  "racks",
  "hvac",
  "textile",
  "fire",
  "lighting",
] as const;

export type ServiceKey = (typeof serviceKeys)[number];

export const serviceIcons: Record<ServiceKey, string> = {
  water: "💧",
  racks: "📦",
  hvac: "❄️",
  textile: "🧵",
  fire: "🔥",
  lighting: "💡",
};

export const serviceBackgroundImages: Record<ServiceKey, string> = {
  water: "/images/gallery/projects/water-treatment/ro-plant.jpg",
  racks: "/images/gallery/machinery/storage-racks/storage-racks.jpg",
  hvac: "/images/gallery/projects/hvac/hvac-ahu.jpg",
  textile: "/images/gallery/machinery/textile/spinning-frame.jpg",
  fire: "/images/gallery/projects/fire-fighting/fire-hydrant.jpg",
  lighting: "/images/gallery/projects/lighting/led-factory.jpg",
};
