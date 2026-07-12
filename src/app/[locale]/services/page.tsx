import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { ServiceCard } from "@/components/ServiceCard";
import { serviceKeys } from "@/data/services";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <PrintButton />
      </PageHeader>
      <div className="print-content mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="no-print mb-8 text-sm text-slate-500">{t("brochureNote")}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {serviceKeys.map((key) => (
            <ServiceCard key={key} serviceKey={key} compact />
          ))}
        </div>
      </div>
    </>
  );
}
