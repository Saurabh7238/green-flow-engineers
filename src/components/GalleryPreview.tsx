import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getFeaturedGallery } from "@/data/gallery";
import { listGalleryItems } from "@/lib/gallery-content";

type Props = { locale: string };

function normalizeGalleryImageUrl(image: string) {
  try {
    const url = new URL(image);
    return url.pathname.startsWith("/api/image/") ? `${url.pathname}${url.search}` : image;
  } catch {
    return image;
  }
}

export async function GalleryPreview({ locale }: Props) {
  const t = await getTranslations("gallery");
  const loc = locale as "en" | "hi";
  const fallbackItems = getFeaturedGallery(6);
  let managedItems: typeof fallbackItems = [];

  try {
    const savedItems = await listGalleryItems();
    managedItems = savedItems
      .filter((item) => item.featured)
      .map((item) => ({
        id: `managed-${item.id}`,
        type: item.type,
        image: normalizeGalleryImageUrl(item.image),
        title: item.title,
        description: item.description,
        location: item.location,
        featured: true,
      }));
  } catch (error) {
    console.error("Failed to load managed gallery previews:", error);
  }

  const items = [...managedItems, ...fallbackItems].slice(0, 6);

  return (
    <section className="bg-slate-100/80 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t("featuredTitle")}</h2>
            <p className="mt-2 text-slate-600">{t("featuredSubtitle")}</p>
          </div>
          <Link
            href={`/${locale}/gallery`}
            className="text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
          >
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
                  alt={item.title[loc]}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 p-3 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {item.title[loc]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
