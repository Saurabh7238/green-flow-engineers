import type { ServiceKey } from "./services";

export type GalleryType = "project" | "machinery";

export type GalleryItem = {
  id: string;
  type: GalleryType;
  image: string;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  location?: { en: string; hi: string };
  serviceKey?: ServiceKey;
  featured?: boolean;
};

export const galleryItems: GalleryItem[] = [
  {
    id: "ro-plant-kanpur",
    type: "project",
    image: "/images/gallery/projects/ro-plant.jpg",
    serviceKey: "water",
    featured: true,
    location: { en: "Kanpur, U.P.", hi: "कानपुर, उ.प्र." },
    title: {
      en: "Industrial RO Plant Commissioning",
      hi: "औद्योगिक आरओ संयंत्र कमीशनिंग",
    },
    description: {
      en: "50 m³/hr RO system with pre-treatment, antiscalant dosing, and permeate storage — installed and commissioned for a textile process house.",
      hi: "50 m³/hr आरओ सिस्टम प्री-ट्रीटमेंट और पर्मिएट स्टोरेज के साथ — टेक्सटाइल प्रोसेस हाउस के लिए स्थापित।",
    },
  },
  {
    id: "etp-installation",
    type: "project",
    image: "/images/gallery/projects/etp-installation.jpg",
    serviceKey: "water",
    featured: true,
    location: { en: "Uttar Pradesh", hi: "उत्तर प्रदेश" },
    title: {
      en: "ETP Installation – Effluent Treatment",
      hi: "ईटीपी स्थापना – अपशिष्ट जल उपचार",
    },
    description: {
      en: "Complete effluent treatment train with primary clarifier, biological aeration, and tertiary filtration for compliant discharge.",
      hi: "प्राथमिक क्लैरिफायर, जैविक एरेशन और तृतीयक फिल्ट्रेशन के साथ पूर्ण ईटीपी।",
    },
  },
  {
    id: "hvac-ahu-site",
    type: "project",
    image: "/images/gallery/projects/hvac-ahu.jpg",
    serviceKey: "hvac",
    featured: true,
    location: { en: "Kanpur Industrial Area", hi: "कानपुर औद्योगिक क्षेत्र" },
    title: {
      en: "AHU & Ducting Erection",
      hi: "एएचयू और डक्टिंग निर्माण",
    },
    description: {
      en: "Air handling unit installation with insulated ductwork and humidification integration for a spinning mill hall.",
      hi: "स्पिनिंग मिल हॉल के लिए एएचयू और ह्यूमिडिफिकेशन एकीकरण।",
    },
  },
  {
    id: "textile-line",
    type: "project",
    image: "/images/gallery/projects/textile-mill.jpg",
    serviceKey: "textile",
    featured: true,
    location: { en: "Kanpur", hi: "कानपुर" },
    title: {
      en: "Textile Processing Line Commissioning",
      hi: "टेक्सटाइल प्रोसेसिंग लाइन कमीशनिंग",
    },
    description: {
      en: "Weaving and processing machinery aligned, leveled, and trial-run completed for production startup.",
      hi: "बुनाई और प्रोसेसिंग मशीनरी संरेखित और परीक्षण संपन्न।",
    },
  },
  {
    id: "fire-system",
    type: "project",
    image: "/images/gallery/projects/fire-hydrant.jpg",
    serviceKey: "fire",
    location: { en: "Commercial Facility", hi: "वाणिज्यिक सुविधा" },
    title: {
      en: "Fire Hydrant & Pump Room",
      hi: "फायर हाइड्रेंट और पंप रूम",
    },
    description: {
      en: "Hydrant network, jockey pump, and diesel fire pump installed with test headers and audit-ready documentation.",
      hi: "हाइड्रेंट नेटवर्क, जॉकी पंप और डीजल फायर पंप स्थापित।",
    },
  },
  {
    id: "led-retrofit",
    type: "project",
    image: "/images/gallery/projects/led-factory.jpg",
    serviceKey: "lighting",
    location: { en: "Manufacturing Plant", hi: "विनिर्माण संयंत्र" },
    title: {
      en: "Factory LED Lighting Retrofit",
      hi: "फैक्टरी एलईडी प्रकाश रेट्रोफिट",
    },
    description: {
      en: "High-bay LED replacement with lux mapping — 60% energy reduction vs. previous metal halide installation.",
      hi: "हाई-बे एलईडी प्रतिस्थापन — 60% ऊर्जा बचत।",
    },
  },
  {
    id: "ro-skid",
    type: "machinery",
    image: "/images/gallery/machinery/ro-skid.jpg",
    serviceKey: "water",
    featured: true,
    title: {
      en: "RO Skid – Membrane Rack",
      hi: "आरओ स्किड – मेम्ब्रेन रैक",
    },
    description: {
      en: "Stainless skid with high-pressure pumps, membrane housings, and instrumentation panel ready for site tie-in.",
      hi: "स्टेनलेस स्किड हाई-प्रेशर पंप और मेम्ब्रेन हाउसिंग के साथ।",
    },
  },
  {
    id: "storage-racks",
    type: "machinery",
    image: "/images/gallery/machinery/storage-racks.jpg",
    serviceKey: "racks",
    title: {
      en: "Heavy Duty Pallet Racking",
      hi: "हेवी ड्यूटी पैलेट रैकिंग",
    },
    description: {
      en: "Bolted racking system rated for industrial warehouse loads with safety pins and load signage.",
      hi: "औद्योगिक गोदाम भार के लिए बोल्टेड रैकिंग सिस्टम।",
    },
  },
  {
    id: "ahu-unit",
    type: "machinery",
    image: "/images/gallery/machinery/ahu-unit.jpg",
    serviceKey: "hvac",
    title: {
      en: "Air Handling Unit (AHU)",
      hi: "एयर हैंडलिंग यूनिट (एएचयू)",
    },
    description: {
      en: "Double-skin AHU with cooling coil, filter section, and VFD-ready fan assembly supplied by Green Flow Engineers.",
      hi: "डबल-स्किन एएचयू कूलिंग कॉइल और फिल्टर सेक्शन के साथ।",
    },
  },
  {
    id: "spinning-frame",
    type: "machinery",
    image: "/images/gallery/machinery/spinning-frame.jpg",
    serviceKey: "textile",
    title: {
      en: "Spinning Frame Installation",
      hi: "स्पिनिंग फ्रेम स्थापना",
    },
    description: {
      en: "Ring frame set alignment, drive coupling, and lubrication schedule established at commissioning.",
      hi: "रिंग फ्रेम संरेखण और ड्राइव कपलिंग कमीशनिंग पर।",
    },
  },
];

export function getFeaturedGallery(limit = 6): GalleryItem[] {
  const featured = galleryItems.filter((i) => i.featured);
  return (featured.length >= limit ? featured : galleryItems).slice(0, limit);
}

export function getGalleryByType(type: GalleryType | "all"): GalleryItem[] {
  if (type === "all") return galleryItems;
  return galleryItems.filter((i) => i.type === type);
}
