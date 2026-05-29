export type BlogCategory =
  | "water-treatment"
  | "hvac"
  | "textile"
  | "fire-safety"
  | "lighting";

export type BlogPost = {
  slug: string;
  category: BlogCategory;
  tags: string[];
  date: string;
  readMinutes: number;
  title: { en: string; hi: string };
  excerpt: { en: string; hi: string };
  content: { en: string; hi: string };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "industrial-ro-systems-guide",
    category: "water-treatment",
    tags: ["RO", "WTP", "recycling", "effluent"],
    date: "2026-03-15",
    readMinutes: 6,
    title: {
      en: "Industrial RO Systems: Design Considerations for Indian Factories",
      hi: "औद्योगिक आरओ सिस्टम: भारतीय कारखानों के लिए डिजाइन विचार",
    },
    excerpt: {
      en: "Learn how to size reverse osmosis plants, manage TDS levels, and integrate RO with ETP for compliant discharge.",
      hi: "आरओ संयंत्र का आकार, टीडीएस प्रबंधन और ईटीपी के साथ एकीकरण के बारे में जानें।",
    },
    content: {
      en: `Reverse osmosis (RO) is the backbone of many industrial water treatment lines. For factories in Kanpur and across Uttar Pradesh, feed water quality varies significantly — from high TDS borewell sources to mixed municipal supplies.

**Key design factors** include daily production capacity, recovery ratio, pre-treatment (multimedia filters, softeners, antiscalant dosing), and post-treatment for process reuse. Pairing RO with an effluent treatment plant (ETP) allows treated reject streams to be polished before discharge, meeting PCB norms.

Green Flow Engineers recommends conducting a detailed water analysis before specification. Proper membrane selection, CIP scheduling, and instrumentation (flow, pressure, conductivity) extend membrane life and reduce downtime.

Maintenance tip: Monitor normalized permeate flow weekly. A 10–15% decline often signals scaling or fouling before irreversible damage occurs.`,
      hi: `रिवर्स ऑस्मोसिस (आरओ) कई औद्योगिक जल उपचार लाइनों की रीढ़ है। कानपुर और उत्तर प्रदेश के कारखानों में फीड जल की गुणवत्ता में काफी अंतर होता है।

**मुख्य डिजाइन कारक** में दैनिक उत्पादन क्षमता, रिकवरी अनुपात, प्री-ट्रीटमेंट और ईटीपी के साथ एकीकरण शामिल हैं। विस्तृत जल विश्लेषण के बाद ही विनिर्देश तय करें।`,
    },
  },
  {
    slug: "ahu-hvac-energy-efficiency",
    category: "hvac",
    tags: ["AHU", "energy", "humidification", "commissioning"],
    date: "2026-02-28",
    readMinutes: 5,
    title: {
      en: "Maximizing AHU and HVAC Efficiency in Textile Mills",
      hi: "टेक्सटाइल मिलों में एएचयू और एचवीएसी दक्षता बढ़ाना",
    },
    excerpt: {
      en: "Variable speed drives, proper humidification control, and commissioning best practices can cut HVAC energy use by 20–30%.",
      hi: "वेरिएबल स्पीड ड्राइव और सही कमीशनिंग से एचवीएसी ऊर्जा उपयोग 20-30% कम हो सकता है।",
    },
    content: {
      en: `Textile mills depend on precise humidity and temperature for yarn quality and machine performance. Oversized AHUs running at fixed speed waste enormous energy.

**Efficiency upgrades** include VFDs on supply and return fans, demand-controlled humidification, heat recovery wheels, and regular filter maintenance. During commissioning, air balance tests ensure design CFM at each zone.

Humidification plants must be sized for peak load while modulating at part load. Green Flow Engineers performs erection, duct leakage checks, and BMS integration so plants operate as designed — not as oversized constant-load systems.`,
      hi: `टेक्सटाइल मिलों को यार्न गुणवत्ता के लिए सटीक आर्द्रता और तापमान चाहिए। ओवरसाइज़ एएचयू बहुत ऊर्जा बर्बाद करते हैं। वीएफडी, डिमांड-कंट्रोल्ड ह्यूमिडिफिकेशन और नियमित रखरखाव से बचत होती है।`,
    },
  },
  {
    slug: "textile-machinery-commissioning",
    category: "textile",
    tags: ["spinning", "weaving", "installation", "alignment"],
    date: "2026-01-20",
    readMinutes: 7,
    title: {
      en: "Textile Machinery Installation: Commissioning Checklist",
      hi: "टेक्सटाइल मशीनरी स्थापना: कमीशनिंग चेकलिस्ट",
    },
    excerpt: {
      en: "From foundation bolts to line shaft alignment — a practical checklist for spinning and weaving unit startups.",
      hi: "नींव से लाइन शाफ्ट संरेखण तक — स्पिनिंग और बुनाई यूनिट स्टार्टअप चेकलिस्ट।",
    },
    content: {
      en: `Successful textile machinery commissioning starts before equipment arrives. Verify civil foundations, vibration isolation, electrical feeders, and compressed air capacity against OEM datasheets.

**Spinning units** require precise machine leveling, belt tensioning, and lubrication schedules at startup. **Weaving and processing lines** need alignment of rollers, tension control calibration, and trial fabric runs.

Green Flow Engineers coordinates with mill planners for phased installation — minimizing production downtime. Document every test run: speed, vibration, temperature, and defect rates form the baseline for warranty and future maintenance.`,
      hi: `सफल कमीशनिंग उपकरण आने से पहले शुरू होती है। नींव, कंपन अलगाव और बिजली क्षमता की पुष्टि करें। सटीक लेवलिंग और परीक्षण दस्तावेज़ीकरण आवश्यक है।`,
    },
  },
  {
    slug: "fire-fighting-system-maintenance",
    category: "fire-safety",
    tags: ["NFPA", "hydrant", "sprinkler", "audit"],
    date: "2025-12-10",
    readMinutes: 5,
    title: {
      en: "Fire Fighting System Maintenance: Staying Audit-Ready",
      hi: "अग्नि नियंत्रण प्रणाली रखरखाव: ऑडिट के लिए तैयार रहें",
    },
    excerpt: {
      en: "Quarterly inspections, pump testing, and hydrant flow records keep your facility compliant and safe.",
      hi: "त्रैमासिक निरीक्षण और पंप परीक्षण आपकी सुविधा को अनुपालन और सुरक्षित रखते हैं।",
    },
    content: {
      en: `Fire safety is non-negotiable in industrial facilities. Systems degrade silently — corroded sprinklers, blocked hydrants, and failed diesel fire pumps are common audit findings.

**Maintenance program essentials:** weekly jockey pump checks, monthly fire pump churn tests, quarterly sprinkler inspections, and annual full-flow hydrant tests. Maintain logbooks with date, technician, and corrective actions.

Green Flow Engineers supplies, installs, and maintains hydrant networks, sprinkler systems, CO2 flooding for electrical rooms, and alarm panels. Proactive maintenance costs far less than production shutdowns after incidents or failed inspections.`,
      hi: `औद्योगिक सुविधाओं में अग्नि सुरक्षा अनिवार्य है। सिस्टम चुपचाप खराब होते हैं। साप्ताहिक जॉकी पंप जांच, मासिक फायर पंप परीक्षण और लॉगबुक रखें।`,
    },
  },
  {
    slug: "led-industrial-lighting-roi",
    category: "lighting",
    tags: ["LED", "lux", "ROI", "sustainability"],
    date: "2025-11-05",
    readMinutes: 4,
    title: {
      en: "LED Industrial Lighting: ROI and Sustainability Benefits",
      hi: "एलईडी औद्योगिक प्रकाश: आरओआई और स्थिरता लाभ",
    },
    excerpt: {
      en: "High-bay LED retrofits typically pay back within 18–24 months while improving workplace safety and visibility.",
      hi: "हाई-बे एलईडी रेट्रोफिट आमतौर पर 18-24 महीनों में भुगतान कर जाते हैं।",
    },
    content: {
      en: `Lighting accounts for 15–25% of industrial electricity bills. Replacing metal halide and fluorescent high-bays with LED fixtures cuts consumption by 50–70% while delivering better lux levels and instant-on reliability.

**Design considerations:** target lux per IS standards for the task (assembly vs. storage), uniform spacing, glare control, and emergency backup integration. Smart controls with occupancy and daylight sensors amplify savings.

Green Flow Engineers provides complete lighting solutions — survey, design, supply, installation, and lux verification reports for energy audits and green building certifications.`,
      hi: `प्रकाश औद्योगिक बिजली बिल का 15-25% है। एलईडी से खपत 50-70% कम हो सकती है। आईएस मानकों के अनुसार लक्स लक्ष्य और स्मार्ट नियंत्रण से बचत बढ़ती है।`,
    },
  },
  {
    slug: "etp-stp-zero-liquid-discharge",
    category: "water-treatment",
    tags: ["ETP", "STP", "ZLD", "compliance"],
    date: "2025-10-18",
    readMinutes: 6,
    title: {
      en: "ETP & STP Trends: Moving Toward Zero Liquid Discharge",
      hi: "ईटीपी और एसटीपी रुझान: जीरो लिक्विड डिस्चार्ज की ओर",
    },
    excerpt: {
      en: "How Indian industries are adopting ZLD and advanced treatment to meet stricter pollution control norms.",
      hi: "भारतीय उद्योग सख्त प्रदूषण नियंत्रण के लिए जेडएलडी अपना रहे हैं।",
    },
    content: {
      en: `Pollution control boards are tightening discharge standards across states. Effluent treatment plants (ETP) and sewage treatment plants (STP) must now often incorporate tertiary treatment, membrane filtration, and evaporation for zero liquid discharge (ZLD).

**Implementation path:** characterize wastewater streams separately, optimize primary and secondary biology, add ultrafiltration/reverse osmosis for reuse, and evaporate concentrates. Capital cost is higher, but water purchase and penalty avoidance improve ROI.

Green Flow Engineers designs integrated WTP/STP/ETP trains with realistic O&M budgets. Start with a treatability study — not a one-size-fits-all catalog plant.`,
      hi: `प्रदूषण नियंत्रण बोर्ड मानक कड़े कर रहे हैं। ईटीपी/एसटीपी में तृतीयक उपचार, मेम्ब्रेन और वाष्पीकरण शामिल हो रहा है। वास्तविक ओएंडएम बजट के साथ एकीकृत डिजाइन जरूरी है।`,
    },
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, limit);
}

export const allTags = Array.from(
  new Set(blogPosts.flatMap((p) => p.tags)),
).sort();

export const allCategories: BlogCategory[] = [
  "water-treatment",
  "hvac",
  "textile",
  "fire-safety",
  "lighting",
];
