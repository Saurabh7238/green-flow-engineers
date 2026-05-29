import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("vision") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-brand-green-dark">{t("visionTitle")}</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">{t("vision")}</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-brand-blue">{t("missionTitle")}</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">{t("mission")}</p>
          </section>
        </div>

        <section className="mt-10 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 p-8 border border-emerald-100">
          <h2 className="text-lg font-bold text-slate-900">{t("sustainabilityTitle")}</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">{t("sustainability")}</p>
        </section>

        <section className="mt-10 flex flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 text-3xl font-bold text-white"
            aria-hidden
          >
            MY
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">
              {t("directorTitle")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{t("directorName")}</h2>
            <p className="text-brand-blue font-medium">{t("directorRole")}</p>
            <p className="mt-4 text-slate-600 leading-relaxed">{t("directorBio")}</p>
          </div>
        </section>
      </div>
    </>
  );
}
