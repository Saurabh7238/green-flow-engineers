import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { GalleryPreview } from "@/components/GalleryPreview";
import { ServiceCard } from "@/components/ServiceCard";
import { HomeSlider } from "@/components/HomeSlider";
import { StatsBar } from "@/components/StatsBar";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ReviewForm } from "@/components/ReviewForm";
import { serviceKeys } from "@/data/services";
import { blogPosts } from "@/data/blog";
import { siteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

const coreValueHighlightClasses = [
  "text-emerald-950",
  "text-sky-950",
  "text-amber-950",
  "text-rose-950",
];

const coreValueHighlights = [
  "End-to-end supply, installation & commissioning",
  "Eco-conscious designs for long-term savings",
  "Responsive maintenance and after-sales support",
  "Industry-standard safety and quality practices",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("siteName"),
    description: t("description"),
    openGraph: {
      title: t("siteName"),
      description: t("description"),
      url: `${siteUrl}/${locale}`,
      type: "website",
      images: [
        {
          url: `${siteUrl}/images/green-flow-logo.png`,
          width: 300,
          height: 300,
          alt: "Green Flow Engineers Logo",
          type: "image/png",
        },
        {
          url: `${siteUrl}/images/service-title-logo.jpeg`,
          width: 1200,
          height: 630,
          alt: "Green Flow Engineers",
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteName"),
      description: t("description"),
      images: [`${siteUrl}/images/service-title-logo.jpeg`],
    },
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

      <section className="bg-slate-100/80 pb-16 pt-4 sm:pt-6">
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

      <section className="mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6">
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

      <section className="bg-slate-100/80 pb-4 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">{tAbout("coreValuesTitle")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl p-4 font-medium text-emerald-950 shadow-sm">
              <span className="mt-0.5 text-lg text-brand-green" aria-hidden>{"\u2713"}</span>
              <span>{coreValueHighlights[0]}</span>
            </div>
            <div className="space-y-3">
              {coreValueHighlights.slice(1).map((value, index) => (
                <div
                  key={value}
                  className={`flex items-start gap-3 rounded-xl p-4 font-medium shadow-sm ${coreValueHighlightClasses[index + 1]}`}
                >
                  <span className="mt-0.5 text-lg text-brand-green" aria-hidden>✓</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100/80 pb-4 pt-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Our Achievements</h2>
          <StatsBar />
        </div>
      </section>

      <section className="bg-white pb-8 pt-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green">Our Clients</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Trusted by leading brands</h2>
          </div>
          <div className="marquee overflow-hidden pb-0">
            <div className="marquee__track inline-flex items-center gap-4">
              {[
                { name: 'Sagar Group', logo: '/images/clients/Sagar.png' },
                { name: 'Bhilosa', logo: '/images/clients/Bhilosa.png' },
                { name: 'Trident', logo: '/images/clients/Trident.png' },
                { name: 'Reliance', logo: '/images/clients/Reliance.png' },
              ].map((client) => (
                <div key={client.name} className="client-logo-container">
                  <img src={client.logo} alt={client.name} className="client-logo" />
                </div>
              ))}
            </div>
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
    </>
  );
}
