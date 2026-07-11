import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { serviceKeys, type ServiceKey } from "@/data/services";
import { getServiceContent, getSlotVariant } from "@/lib/service-content";

type Props = {
  params: Promise<{ locale: string; serviceKey: string; slug: string }>;
};

const waterPlantOptions = [
  "water-treatment-plant",
  "sewage-treatment-plant",
  "effluent-treatment-plant",
  "industrial-ro-system",
] as const;

const rackSystemOptions = [
  "pallet-rack-heavy-duty-rack",
  "cantilever-rack",
  "fifo-flow-rack-gravity-flow",
  "mezzanine-floor-multi-tier-system",
  "long-span-rack-medium-duty-rack",
  "slotted-angle-rack",
  "supermarket-rack-display-rack",
  "mobile-compacter",
] as const;

const hvacSystemOptions = [
  "industrial-humidification-plant",
  "air-handling-unit-ahu",
  "complete-hvac-system",
  "ventilation-exhaust-system",
] as const;

const textileMachineryOptions = [
  "spinning-unit-equipment",
  "weaving-machinery-looms",
  "processing-finishing-units",
] as const;

const fireSystemOptions = [
  "fire-detection-alarm-systems-addressable-vesda",
  "water-based-suppression-hydrants-sprinklers",
  "gas-based-clean-agent-suppression-co2-fm-200-novec",
  "foam-passive-fireproofing-containment",
] as const;

const lightingSystemOptions = [
  "industrial-factory-floor-high-bay-lighting",
  "commercial-office-recessed-linear-lighting",
  "explosion-proof-hazardous-zone-lighting",
  "intelligent-lighting-control-systems-dali",
] as const;

const fallbackRackItems = [
  "Slotted Angle Rack",
  "Multi-Tier Racking System",
  "Display Rack",
  "Supermarket Rack",
  "FIFO Flow Rack (Gravity Flow Rack)",
  "Two Tier Racking System",
  "Modular Storage Rack",
  "Warehouse Storage Rack",
  "Heavy Duty Rack",
  "Medium Duty Rack",
  "Long Span Rack",
  "Pallet Rack",
  "Cantilever Rack",
  "Mezzanine Floor",
  "Mobile Compacter",
  "Storage System",
].map((title) => ({
  title,
  description: "Storage solution details can be updated from the admin panel.",
  imageUrl: "",
}));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, serviceKey, slug } = await params;
  if (!serviceKeys.includes(serviceKey as ServiceKey)) {
    return { title: "Service Detail" };
  }

  if (serviceKey === "water") {
    if (!waterPlantOptions.includes(slug as (typeof waterPlantOptions)[number])) {
      return { title: "Plant Project" };
    }
    const t = await getTranslations({ locale, namespace: `services.waterPlants.${slug}` });
    return { title: t("title"), description: t("description") };
  }

  if (serviceKey === "racks" || serviceKey === "hvac" || serviceKey === "textile" || serviceKey === "fire" || serviceKey === "lighting") {
    const options = serviceKey === "racks" ? rackSystemOptions : serviceKey === "hvac" ? hvacSystemOptions : serviceKey === "textile" ? textileMachineryOptions : serviceKey === "fire" ? fireSystemOptions : lightingSystemOptions;
    const namespace = serviceKey === "racks" ? "rackSystems" : serviceKey === "hvac" ? "hvacSystems" : serviceKey === "textile" ? "textileSystems" : serviceKey === "fire" ? "fireSystems" : "lightingSystems";
    if (!options.some((option) => option === slug)) {
      return { title: serviceKey === "racks" ? "Storage Rack" : serviceKey === "hvac" ? "HVAC System" : serviceKey === "textile" ? "Textile Machinery" : serviceKey === "fire" ? "Fire Fighting System" : "Industrial & Commercial Lighting" };
    }
    const t = await getTranslations({ locale, namespace: `services.${namespace}.${slug}` });
    return { title: t("title"), description: t("description") };
  }

  return { title: "Service Detail" };
}

export default async function ServiceSlugPage({ params }: Props) {
  const { locale, serviceKey, slug } = await params;
  setRequestLocale(locale);

  if (!serviceKeys.includes(serviceKey as ServiceKey)) {
    notFound();
  }

  const servicesT = await getTranslations({ locale, namespace: "services" });
  const activeVariant = getSlotVariant(serviceKey as ServiceKey, slug);
  const serviceContent = await getServiceContent(serviceKey as ServiceKey, locale, activeVariant);

  if (serviceKey === "water") {
    if (!waterPlantOptions.includes(slug as (typeof waterPlantOptions)[number])) {
      notFound();
    }

    const t = await getTranslations({ locale, namespace: `services.waterPlants.${slug}` });
    const waterSections = serviceContent?.sections?.length
      ? serviceContent.sections
      : serviceContent?.items?.length
      ? [
          {
            id: slugify(slug),
            label: serviceContent.title || t("title"),
            items: serviceContent.items.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description_short,
              imageUrl: item.media_url || "",
              alt: item.title,
            })),
          },
        ]
      : [];

    return (
      <>
        <PageHeader title={t("title")} subtitle={servicesT("subtitle")}>
          <PrintButton />
        </PageHeader>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Link href={`/${locale}/services/${serviceKey}`} className="mb-8 inline-flex items-center text-sm font-semibold text-brand-green hover:underline">
            ← {servicesT("title")}
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {serviceContent?.imageUrl ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                  <img src={serviceContent.imageUrl} alt={serviceContent.title || t("title")} className="h-80 w-full object-cover" />
                </div>
              </div>
            ) : null}
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">{serviceContent?.title || t("title")}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-700">{serviceContent?.description || t("description")}</p>
          </div>

          {waterSections.length ? (
            <div className="space-y-6">
              {waterSections.map((section) => (
                <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h2 className="text-2xl font-semibold text-slate-900">{section.label}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        {item.imageUrl ? (
                          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <img src={item.imageUrl} alt={item.alt || item.title} className="h-48 w-full object-cover" />
                          </div>
                        ) : null}
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </>
    );
  }

  if (serviceKey === "racks" || serviceKey === "hvac" || serviceKey === "textile" || serviceKey === "fire" || serviceKey === "lighting") {
    const options = serviceKey === "racks" ? rackSystemOptions : serviceKey === "hvac" ? hvacSystemOptions : serviceKey === "textile" ? textileMachineryOptions : serviceKey === "fire" ? fireSystemOptions : lightingSystemOptions;
    const namespace = serviceKey === "racks" ? "rackSystems" : serviceKey === "hvac" ? "hvacSystems" : serviceKey === "textile" ? "textileSystems" : serviceKey === "fire" ? "fireSystems" : "lightingSystems";
    if (!options.some((option) => option === slug)) {
      notFound();
    }
    const t = await getTranslations({ locale, namespace: `services.${namespace}.${slug}` });
    const rackSections = serviceContent?.sections?.length
      ? serviceContent.sections
      : serviceContent?.items?.length
        ? [{ id: slug, label: serviceContent.title || t("title"), items: serviceContent.items.map((item) => ({ id: item.id, title: item.title, description: item.description_short, imageUrl: item.media_url || "", alt: item.title })) }]
        : [];

    return (
      <>
        <PageHeader title={t("title")} subtitle={servicesT("subtitle")}>
          <PrintButton />
        </PageHeader>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Link href={`/${locale}/services/${serviceKey}`} className="mb-8 inline-flex items-center text-sm font-semibold text-brand-green hover:underline">
            ← {servicesT("title")}
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {serviceContent?.imageUrl ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                  <img src={serviceContent.imageUrl} alt={serviceContent.title || t("title")} className="h-80 w-full object-cover" />
                </div>
              </div>
            ) : null}
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">{serviceContent?.title || t("title")}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-700">{serviceContent?.description || t("description")}</p>
          </div>

          {rackSections.length ? (
            <div className="mt-6 space-y-6">
              {rackSections.map((section) => (
                <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h2 className="text-2xl font-semibold text-slate-900">{section.label}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.alt || item.title} className="mb-4 h-48 w-full rounded-2xl object-cover" /> : null}
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </>
    );
  }

  if (serviceContent) {
    const genericTitle = serviceContent.title || servicesT("title");
    return (
      <>
        <PageHeader title={genericTitle} subtitle={servicesT("subtitle")}>
          <PrintButton />
        </PageHeader>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Link href={`/${locale}/services/${serviceKey}`} className="mb-8 inline-flex items-center text-sm font-semibold text-brand-green hover:underline">
            ← {servicesT("title")}
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {serviceContent.imageUrl ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                  <img src={serviceContent.imageUrl} alt={genericTitle} className="h-80 w-full object-cover" />
                </div>
              </div>
            ) : null}
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">{genericTitle}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-700">{serviceContent.description || servicesT("subtitle")}</p>
          </div>
        </div>
      </>
    );
  }

  notFound();
}
