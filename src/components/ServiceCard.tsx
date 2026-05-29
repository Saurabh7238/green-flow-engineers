"use client";

import type { ServiceKey } from "@/data/services";
import { serviceIcons } from "@/data/services";
import { useTranslations } from "next-intl";

type ServiceCardProps = {
  serviceKey: ServiceKey;
  compact?: boolean;
};

export function ServiceCard({ serviceKey, compact = false }: ServiceCardProps) {
  const t = useTranslations(`services.items.${serviceKey}`);

  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-green/40 hover:shadow-md ${
        compact ? "" : "h-full"
      }`}
    >
      <span className="text-3xl" role="img" aria-hidden>
        {serviceIcons[serviceKey]}
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{t("title")}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("description")}</p>
    </article>
  );
}
