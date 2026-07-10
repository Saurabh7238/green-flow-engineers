import { type ServiceKey } from "@/data/services";

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
