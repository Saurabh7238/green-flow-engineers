import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { GalleryPreview } from "@/components/GalleryPreview";
import { ServiceCard } from "@/components/ServiceCard";
import { serviceKeys } from "@/data/services";
import { blogPosts } from "@/data/blog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("siteName"),
    description: t("description"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tMeta = await getTranslations("meta");
  const tCta = await getTranslations("cta");
  const tNav = await getTranslations("nav");
  const tCat = await getTranslations("categories");
  const loc = locale as "en" | "hi";

  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-sky-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">
            {tMeta("tagline")}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-emerald-50">{t("heroSubtitle")}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/contact`}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
            >
              {tCta("contact")}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="rounded-lg border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {tCta("blog")}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="rounded-lg border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {tCta("services")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">{t("introTitle")}</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">{t("introText")}</p>
        </div>
      </section>

      <section className="bg-slate-100/80 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">{t("servicesOverview")}</h2>
            <Link
              href={`/${locale}/services`}
              className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
            >
              {tCta("viewAllServices")} →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => (
              <ServiceCard key={key} serviceKey={key} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">{t("whyUsTitle")}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["experience", "sustainability", "support", "compliance"] as const).map(
            (key) => (
              <li
                key={key}
                className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-sm font-medium text-slate-700"
              >
                <span className="mb-2 block text-2xl text-brand-green">✓</span>
                {t(`whyUs.${key}`)}
              </li>
            ),
          )}
        </ul>
      </section>

      <GalleryPreview locale={locale} />

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">{tNav("blog")}</h2>
            <Link
              href={`/${locale}/blog`}
              className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
            >
              {tCta("blog")} →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <span className="text-xs font-semibold uppercase text-brand-blue">
                  {tCat(post.category)}
                </span>
                <h3 className="mt-2 font-bold text-slate-900">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="hover:text-brand-green-dark"
                  >
                    {post.title[loc]}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {post.excerpt[loc]}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
