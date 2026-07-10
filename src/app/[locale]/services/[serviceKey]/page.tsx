import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { serviceKeys, type ServiceKey } from "@/data/services";
import { getServiceContent, getAllServiceContent, getSlotVariant } from "@/lib/service-content";

type Props = {
  params: Promise<{ locale: string; serviceKey: string }>;
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
  const { locale, serviceKey } = await params;
  const isValidService = serviceKeys.includes(serviceKey as ServiceKey);

  if (!isValidService) {
    return { title: "Service" };
  }

  const t = await getTranslations({ locale, namespace: `services.items.${serviceKey}` });
  return { title: t("title"), description: t("description") };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, serviceKey } = await params;
  setRequestLocale(locale);

  if (!serviceKeys.includes(serviceKey as ServiceKey)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: `services.items.${serviceKey}` });
  const servicesT = await getTranslations({ locale, namespace: "services" });
  const isWaterService = serviceKey === "water";
  const isRackService = serviceKey === "racks";
  const isTextileService = serviceKey === "textile";
  const rackTypes = (isRackService ? (t.raw("rackTypes") as string[] | undefined) : undefined) ?? [];
  const textileMachineryTypes = (isTextileService ? (t.raw("machineryTypes") as string[] | undefined) : undefined) ?? [];
  const allServiceContents = await getAllServiceContent(locale);
  const normalizedServiceContents = allServiceContents.filter(
    (content): content is NonNullable<(typeof allServiceContents)[number]> => content !== null,
  );
  const serviceGroupContents = normalizedServiceContents.filter((content) => content.serviceKey === serviceKey);
  const heroContent =
    serviceKey === "textile"
      ? null
      : (serviceGroupContents.find((content) => content.imageUrl || content.items?.some((item) => item.media_url)) ?? serviceGroupContents[0] ?? null);
  const serviceContent = serviceKey === "textile" ? null : heroContent;
  const textileContents = normalizedServiceContents.filter((content) => content.serviceKey === "textile");
  const rackItems =
    serviceContent?.sections?.flatMap((section) => section.items).length
      ? serviceContent?.sections?.flatMap((section) => section.items) ?? []
      : fallbackRackItems;

  const contentSections = (() => {
    if (!serviceGroupContents.length) return [];

    const sectionMap = new Map<string, any[]>();

    serviceGroupContents.forEach((content) => {
      const contentVariant = content.variant || "";
      const contentGroupLabel = contentVariant || content.title || "Uncategorized";
      if (content.sections?.length) {
        content.sections.forEach((section) => {
          const label = section.label || contentGroupLabel;
          const existing = sectionMap.get(label) || [];
          sectionMap.set(label, existing.concat(section.items));
        });
      } else if (content.items?.length) {
        content.items.forEach((item) => {
          const label = item.subtype || contentGroupLabel;
          const existing = sectionMap.get(label) || [];
          existing.push(item);
          sectionMap.set(label, existing);
        });
      }
    });

    return Array.from(sectionMap.entries()).map(([label, items]) => ({
      id: slugify(label),
      label,
      items,
    }));
  })();

  return (
    <>
      <PageHeader title={t("title")} subtitle={servicesT("subtitle")}>
        <PrintButton />
      </PageHeader>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link
          href={`/${locale}/services`}
          className="mb-8 inline-flex items-center text-sm font-semibold text-brand-green hover:underline"
        >
          ← {servicesT("title")}
        </Link>

        {isWaterService ? (
          <div className="grid gap-6 md:grid-cols-2">
            {waterPlantOptions.map((plantKey) => (
              <Link
                key={plantKey}
                href={`/${locale}/services/${serviceKey}/${plantKey}`}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  {servicesT(`waterPlants.${plantKey}.title`)}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {servicesT(`waterPlants.${plantKey}.description`)}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-brand-green">
                  View projects →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {serviceContent?.imageUrl || serviceContent?.items?.find((item) => item.media_url)?.media_url ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                  <img
                    src={serviceContent.imageUrl || serviceContent.items?.find((item) => item.media_url)?.media_url || ""}
                    alt={serviceContent.title || t("title")}
                    className="h-64 w-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                {serviceContent?.title || t("title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                {serviceContent?.description || t("description")}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-slate-600">
                We provide end-to-end solutions for this service, from consultation and design to supply, installation, and commissioning.
              </p>
            </div>

            {contentSections.length ? (
              <div className="space-y-6">
                {contentSections.map((section) => (
                  <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">{section.label}</h3>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {section.items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          {'media_type' in item && item.media_type === 'video' ? (
                            <video
                              src={item.media_url}
                              className="mb-4 h-48 w-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : item.imageUrl || item.media_url ? (
                            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              <img
                                src={item.imageUrl ?? item.media_url}
                                alt={item.title}
                                className="h-48 w-full object-cover"
                              />
                            </div>
                          ) : null}
                          <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {'description' in item ? item.description : item.description_short}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {isRackService ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">{t("rackTypesHeading")}</h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {rackItems.map((item) => (
                      <Link
                        key={item.title}
                        href={`/${locale}/services/${serviceKey}/${slugify(item.title)}`}
                        className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-sm"
                      >
                        {item.imageUrl ? (
                          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                          </div>
                        ) : null}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                          <span className="mt-4 inline-flex text-sm font-semibold text-brand-green">View details →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {isRackService && rackTypes.length > 0 && false ? (
              rackTypes.length > 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">{t("rackTypesHeading")}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {rackTypes.map((rackType) => (
                      <div key={rackType} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">{rackType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            ) : null}

            {isTextileService ? (
              textileContents.length ? (
                <div className="space-y-8">
                  {textileContents.map((content) => (
                    <div key={content.variant || content.title || content.description || Math.random()} className="space-y-6">
                      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <h2 className="text-2xl font-semibold text-slate-900">
                          {content.variant ? `${content.variant} Machinery` : content.title || t("title")}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-slate-700">
                          {content.description || t("description")}
                        </p>
                        {content.imageUrl ? (
                          <div className="mt-6 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                            <img
                              src={content.imageUrl}
                              alt={content.title || content.variant || t("title")}
                              className="h-80 w-full object-cover"
                            />
                          </div>
                        ) : null}
                      </div>

                      {content.sections?.length ? (
                        <div className="space-y-6">
                          {content.sections.map((section) => (
                            <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                              <h3 className="text-xl font-semibold text-slate-900">{section.label}</h3>
                              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {section.items.map((item) => (
                                  <div key={item.id} className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    {item.imageUrl ? (
                                      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                        <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                                      </div>
                                    ) : null}
                                    <div>
                                      <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : textileMachineryTypes.length > 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">{t("machineryTypesHeading")}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {textileMachineryTypes.map((machineryType) => (
                      <div key={machineryType} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">{machineryType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
