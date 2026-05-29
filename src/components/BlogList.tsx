"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  allCategories,
  allTags,
  blogPosts,
  type BlogCategory,
} from "@/data/blog";
import { BlogSearch } from "./BlogSearch";

export function BlogList() {
  const locale = useLocale() as "en" | "hi";
  const t = useTranslations("blog");
  const tCat = useTranslations("categories");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategory | "all">("all");
  const [tag, setTag] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (tag !== "all" && !post.tags.includes(tag)) return false;
      if (!q) return true;
      const title = post.title[locale].toLowerCase();
      const excerpt = post.excerpt[locale].toLowerCase();
      const tags = post.tags.join(" ").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || tags.includes(q);
    });
  }, [query, category, tag, locale]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <BlogSearch value={query} onChange={setQuery} />
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="no-print space-y-6 lg:col-span-1">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("categories")}
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    category === "all"
                      ? "bg-brand-green/10 font-semibold text-brand-green-dark"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t("allPosts")}
                </button>
              </li>
              {allCategories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      category === cat
                        ? "bg-brand-green/10 font-semibold text-brand-green-dark"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tCat(cat)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("tags")}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTag("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tag === "all"
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("allPosts")}
              </button>
              {allTags.map((tg) => (
                <button
                  key={tg}
                  type="button"
                  onClick={() => setTag(tg)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    tag === tg
                      ? "bg-brand-blue text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              {t("noResults")}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                    {tCat(post.category)}
                  </span>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="hover:text-brand-green-dark"
                    >
                      {post.title[locale]}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-slate-600">
                    {post.excerpt[locale]}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(
                        locale === "hi" ? "hi-IN" : "en-IN",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </time>
                    <span>
                      {post.readMinutes} {t("readTime")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.tags.map((tg) => (
                      <span
                        key={tg}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-brand-green-dark"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
