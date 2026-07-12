"use client";

import type { ServiceKey } from "@/data/services";
import { serviceBackgroundImages, serviceIcons } from "@/data/services";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type ServiceCardProps = {
  serviceKey: ServiceKey;
  compact?: boolean;
};

export function ServiceCard({ serviceKey, compact = false }: ServiceCardProps) {
  const t = useTranslations(`services.items.${serviceKey}`);
  const locale = useLocale();
  const href = `/${locale}/services/${serviceKey}`;
  const hasBackgroundImage = compact;

  return (
    <Link href={href} className="group block h-full">
      <article
        className={`relative isolate overflow-hidden rounded-2xl border p-6 shadow-sm transition ${
          hasBackgroundImage
            ? "border-transparent bg-slate-900 bg-cover bg-center text-white hover:-translate-y-1 hover:shadow-lg"
            : "border-slate-200 bg-white hover:border-brand-green/40 hover:shadow-md"
        } ${compact ? "" : "h-full"}`}
        style={
          hasBackgroundImage
            ? { backgroundImage: `url(${serviceBackgroundImages[serviceKey]})` }
            : undefined
        }
      >
        {hasBackgroundImage && (
          <span className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/90 via-emerald-950/75 to-slate-950/50" />
        )}
        <div className="relative">
          <span className="text-3xl" role="img" aria-hidden>
            {serviceIcons[serviceKey]}
          </span>
          <h3 className={`mt-4 text-lg font-bold ${hasBackgroundImage ? "text-white" : "text-slate-900"}`}>
            {t("title")}
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${hasBackgroundImage ? "text-slate-100" : "text-slate-600"}`}>
            {t("description")}
          </p>
          <span className={`mt-4 inline-flex items-center text-sm font-semibold transition group-hover:translate-x-1 ${
            hasBackgroundImage ? "text-emerald-200" : "text-brand-green"
          }`}>
            Learn more &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}
