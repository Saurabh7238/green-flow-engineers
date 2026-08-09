"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getFeaturedGallery } from "@/data/gallery";
import type { ManagedGalleryItem } from "@/lib/gallery-content";

type Props = { locale: string };

function normalizeGalleryImageUrl(image: string) {
  try {
    const url = new URL(image);
    return url.pathname.startsWith("/api/image/") ? `${url.pathname}${url.search}` : image;
  } catch {
    return image;
  }
}
export function GalleryPreview({ locale }: Props) {
  const t = useTranslations("gallery");
  const loc = locale as "en" | "hi";
  const fallbackItems = getFeaturedGallery(6);

  const [managedItems, setManagedItems] = useState<ManagedGalleryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const saved: ManagedGalleryItem[] = Array.isArray(data.data) ? data.data : [];
        setManagedItems(
          saved
            .filter((item) => item.featured)
            .map((item) => ({ ...item, image: normalizeGalleryImageUrl(item.image) })),
        );
      } catch (err) {
        // Ignore — we'll show fallback items
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const items = [...managedItems, ...fallbackItems].slice(0, 6);

  return (
    <section className="bg-slate-100/80 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t("featuredTitle")}</h2>
            <p className="mt-2 text-slate-600">{t("featuredSubtitle")}</p>
          </div>
          <Link href={`/${locale}/gallery`} className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
            {t("viewGallery")} →
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/gallery`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={typeof item.title === "string" ? item.title : item.title[loc]}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 p-3 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {typeof item.title === "string" ? item.title : item.title[loc]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
