import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { serviceKeys, type ServiceKey } from "@/data/services";
import { getServiceContent } from "@/lib/service-content";

type Props = {
  params: Promise<{ locale: string; serviceKey: string; slug: string }>;
};

const waterPlantOptions = [
  "water-treatment-plant",
  "sewage-treatment-plant",
  "effluent-treatment-plant",
  "industrial-ro-system",
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

  if (serviceKey === "racks") {
    return { title: slug.replace(/-/g, " ") };
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

  if (serviceKey === "water") {
    if (!waterPlantOptions.includes(slug as (typeof waterPlantOptions)[number])) {
      notFound();
    }

    const t = await getTranslations({ locale, namespace: `services.waterPlants.${slug}` });
    const serviceContent = await getServiceContent("water", locale, slug);

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

          {serviceContent?.sections?.length ? (
            <div className="space-y-6">
              {serviceContent.sections.map((section) => (
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

  if (serviceKey === "racks") {
    const serviceContent = await getServiceContent("racks", locale);
    const item =
      serviceContent?.sections
        ?.flatMap((section) => section.items)
        .find((entry) => slugify(entry.title) === slug) ??
      fallbackRackItems.find((entry) => slugify(entry.title) === slug);

    if (!item) {
      notFound();
    }

    return (
      <>
        <PageHeader title={item.title} subtitle={servicesT("subtitle")}>
          <PrintButton />
        </PageHeader>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Link href={`/${locale}/services/${serviceKey}`} className="mb-8 inline-flex items-center text-sm font-semibold text-brand-green hover:underline">
            ← {servicesT("title")}
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {item.imageUrl ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                  <img src={item.imageUrl} alt={item.title} className="h-80 w-full object-cover" />
                </div>
              </div>
            ) : null}
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">{item.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              {item.description || "Detailed information for this storage solution will appear here once added from the admin panel."}
            </p>
          </div>
        </div>
      </>
    );
  }

  notFound();
}
