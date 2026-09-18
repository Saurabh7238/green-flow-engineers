import Link from "next/link";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { GalleryPreview } from "@/components/GalleryPreview";
import { ServiceCard } from "@/components/ServiceCard";
import { HomeSlider } from "@/components/HomeSlider";
import { serviceKeys } from "@/data/services";
import { blogPosts } from "@/data/blog";
import { galleryItems } from "@/data/gallery";
import { siteConfig } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

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
  const loc = locale as "en" | "hi";

  const featuredPosts = blogPosts.slice(0, 3);
  const featuredProjects = galleryItems.filter((item) => item.type === "project").slice(0, 3);
  const processSteps = ["Consultation", "Site assessment", "Engineering & design", "Supply & installation", "Testing & commissioning", "After-sales support"];

  return (
    <>
      <HomeSlider />

      <section className="border-y border-[#dce6df] bg-[#f5f7f4] py-7">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {["Engineering solutions", "Project support", "Quality-focused execution", "Sustainable systems"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 border-l-2 border-brand-green px-4 py-2">
                <span className="font-mono text-xs font-bold text-brand-green">0{index + 1}</span>
                <span className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">Engineering with purpose</p>
            <h2 className="section-title">Built for the way industry moves.</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-slate-600">{t("introText")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${locale}/about`} className="button button-dark">{tCta("learnMore")} <span aria-hidden="true">↗</span></Link>
              <a href={siteConfig.phoneHref} className="button button-outline">Talk to an engineer</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#f5f7f4]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div><p className="eyebrow">Capabilities</p><h2 className="section-title">What we deliver</h2></div>
            <Link href={`/${locale}/services`} className="arrow-link">{tCta("viewAllServices")} <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => <ServiceCard key={key} serviceKey={key} compact />)}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#14241f] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="eyebrow text-emerald-300">How we work</p><h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">From brief to working system.</h2></div>
            <div className="grid gap-0 sm:grid-cols-2">
              {processSteps.map((step, index) => (
                <div key={step} className="process-step border-t border-white/15 py-5 sm:pr-8">
                  <span className="font-mono text-xs text-emerald-300">0{index + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold">{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GalleryPreview locale={locale} />

      <section className="section-pad bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div><p className="eyebrow">Selected work</p><h2 className="section-title">Projects in motion</h2></div>
            <Link href={`/${locale}/gallery`} className="arrow-link">View project gallery <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link href={`/${locale}/gallery`} key={project.id} className="project-tile group">
                <Image src={project.image} alt={project.title[loc]} fill sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="project-tile__caption"><span className="eyebrow text-emerald-300">{project.serviceKey}</span><h3>{project.title[loc]}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#f5f7f4]">
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
                className="border-t border-slate-300 py-5"
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

      <section className="section-pad bg-brand-green text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div><p className="eyebrow text-emerald-100">Start a conversation</p><h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Have a system to plan?</h2></div>
          <Link href={`/${locale}/enquiry`} className="button button-light">Request a quote <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
