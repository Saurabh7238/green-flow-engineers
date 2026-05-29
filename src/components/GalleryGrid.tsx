"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  galleryItems,
  getGalleryByType,
  type GalleryItem,
  type GalleryType,
} from "@/data/gallery";

type Filter = GalleryType | "all";

export function GalleryGrid({ showFilter = true }: { showFilter?: boolean }) {
  const locale = useLocale() as "en" | "hi";
  const t = useTranslations("gallery");
  const [filter, setFilter] = useState<Filter>("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const items = showFilter ? getGalleryByType(filter) : galleryItems;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "project", label: t("projects") },
    { key: "machinery", label: t("machinery") },
  ];

  return (
    <>
      {showFilter && (
        <div className="no-print mb-8 flex flex-wrap gap-2">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === key
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightbox(item)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-brand-green/40 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title[locale]}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {item.type === "project" ? t("projects") : t("machinery")}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900 line-clamp-2">
                {item.title[locale]}
              </h3>
              {item.location && (
                <p className="mt-1 text-xs text-brand-blue">{item.location[locale]}</p>
              )}
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                {item.description[locale]}
              </p>
            </div>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal
          aria-label={lightbox.title[locale]}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative aspect-video w-full bg-slate-900 sm:aspect-[16/10]">
              <Image
                src={lightbox.image}
                alt={lightbox.title[locale]}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900">{lightbox.title[locale]}</h2>
              {lightbox.location && (
                <p className="mt-1 text-sm text-brand-blue">{lightbox.location[locale]}</p>
              )}
              <p className="mt-3 text-slate-600 leading-relaxed">
                {lightbox.description[locale]}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
