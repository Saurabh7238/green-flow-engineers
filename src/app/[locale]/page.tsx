import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { GalleryPreview } from "@/components/GalleryPreview";
import { ServiceCard } from "@/components/ServiceCard";
import { HomeSlider } from "@/components/HomeSlider";
import { QuotesSection } from "@/components/QuotesSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ReviewForm } from "@/components/ReviewForm";
import { serviceKeys } from "@/data/services";
import { blogPosts } from "@/data/blog";

type Props = { params: Promise<{ locale: string }> };

const coreValueColorClasses = [
  "border-emerald-200 bg-emerald-50 text-emerald-950",
  "border-sky-200 bg-sky-50 text-sky-950",
  "border-amber-200 bg-amber-50 text-amber-950",
  "border-rose-200 bg-rose-50 text-rose-950",
  "border-violet-200 bg-violet-50 text-violet-950",
  "border-cyan-200 bg-cyan-50 text-cyan-950",
  "border-lime-200 bg-lime-50 text-lime-950",
  "border-orange-200 bg-orange-50 text-orange-950",
  "border-indigo-200 bg-indigo-50 text-indigo-950",
];

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
  const tCta = await getTranslations("cta");
  const tNav = await getTranslations("nav");
  const tCat = await getTranslations("categories");
  const tAbout = await getTranslations("about");
  const loc = locale as "en" | "hi";
  const coreValues = tAbout.raw("coreValues") as string[];

  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <>
      <HomeSlider />

      <section className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50/70 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-base font-bold uppercase tracking-[0.18em] text-brand-green sm:text-2xl">Green Flow Engineers</p>
            <h1 className="mt-3 text-1xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineering Progress. Inspiring Sustainability.
            </h1>
            <p className="mt-4 text-sm font-semibold text-slate-600">Established in 2025 | Kanpur, Uttar Pradesh</p>
            <p className="mt-6 text-base leading-relaxed text-slate-700">
              Green Flow Engineers is a trusted engineering solutions provider based in Kanpur, Uttar Pradesh. Since 2025,
              we have been delivering advanced, sustainable, and reliable systems for industrial and commercial sectors across India.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Driven by innovation, quality, and environmental responsibility, we focus on precision engineering, timely project
              execution, and long-term customer satisfaction. Our goal is to build infrastructure that improves efficiency, reduces
              environmental impact, and meets global quality standards.
            </p>
          </div>

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

      <section className="bg-slate-100/80 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">{tAbout("coreValuesTitle")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, index) => (
              <div
                key={value}
                className={`rounded-xl border p-5 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${coreValueColorClasses[index % coreValueColorClasses.length]}`}
              >
                <span className="mr-2 text-brand-green" aria-hidden>✓</span>
                {value}
              </div>
            ))}
          </div>
        </div>
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

      <ReviewsSection title={t("quotesTitle")} subtitle={t("quotesSubtitle")} />
      <ReviewForm />
      <QuotesSection title={t("quotesTitle")} subtitle={t("quotesSubtitle")} />
    </>
  );
}
