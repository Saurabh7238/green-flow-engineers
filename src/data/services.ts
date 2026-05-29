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
