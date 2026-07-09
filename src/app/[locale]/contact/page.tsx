import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/lib/site";
import { getSiteContent } from "@/lib/site-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const dbContent = await getSiteContent();
  const address =
    dbContent.contactAddress || (locale === "hi" ? siteConfig.address.hi : siteConfig.address.en);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase text-slate-500">{t("phone")}</h2>
            <a
              href={siteConfig.phoneHref}
              className="mt-2 block text-lg font-semibold text-brand-green-dark hover:underline"
            >
              {dbContent.phone || siteConfig.phone}
            </a>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase text-slate-500">{t("email")}</h2>
            <a
              href={siteConfig.emailHref}
              className="mt-2 block text-lg font-semibold text-brand-blue hover:underline"
            >
              {dbContent.email || siteConfig.email}
            </a>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase text-slate-500">{t("address")}</h2>
            <p className="mt-2 text-slate-700 leading-relaxed">{address}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
