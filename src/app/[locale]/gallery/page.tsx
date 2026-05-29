import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { GalleryGrid } from "@/components/GalleryGrid";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <PrintButton />
      </PageHeader>
      <div className="print-content mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="no-print mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("replaceNote")}
        </p>
        <GalleryGrid />
      </div>
    </>
  );
}
