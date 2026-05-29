import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ArticleContent } from "@/components/ArticleContent";
import { PrintButton } from "@/components/PrintButton";
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/data/blog";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return blogPosts.flatMap((post) =>
    ["en", "hi"].map((locale) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const loc = locale as "en" | "hi";
  return {
    title: post.title[loc],
    description: post.excerpt[loc],
    keywords: post.tags,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const tCta = await getTranslations("cta");
  const tCat = await getTranslations("categories");
  const loc = locale as "en" | "hi";
  const related = getRelatedPosts(post);

  return (
    <article className="print-content mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}/blog`}
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          ← {tCta("backToBlog")}
        </Link>
        <PrintButton />
      </div>

      <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
        {tCat(post.category)}
      </span>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
        {post.title[loc]}
      </h1>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString(
            loc === "hi" ? "hi-IN" : "en-IN",
            { year: "numeric", month: "long", day: "numeric" },
          )}
        </time>
        <span>·</span>
        <span>
          {post.readMinutes} {t("readTime")}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-brand-green-dark"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-10 border-t border-slate-200 pt-10">
        <ArticleContent content={post.content[loc]} />
      </div>

      {related.length > 0 && (
        <section className="no-print mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-lg font-bold text-slate-900">{t("relatedPosts")}</h2>
          <ul className="mt-4 space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/${locale}/blog/${r.slug}`}
                  className="font-medium text-brand-blue hover:underline"
                >
                  {r.title[loc]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
