"use client";

import { useEffect, useRef, useState } from "react";
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
  const cardRef = useRef<HTMLElement | null>(null);
  const [isCentered, setIsCentered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.1) {
            setIsVisible(true);
          }
          setIsCentered(entry.intersectionRatio >= 0.25);
        });
      },
      {
        threshold: [0.15, 0.25, 0.5, 0.75],
        rootMargin: "-30% 0px -30% 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Link href={href} className="group block h-full">
      <article
        ref={cardRef}
        className={`relative isolate overflow-hidden rounded-2xl border p-6 transition-all duration-500 ease-out will-change-transform ${
          hasBackgroundImage
            ? "border-transparent bg-slate-900 bg-cover bg-center text-white"
            : "border-slate-200 bg-white"
        } ${compact ? "" : "h-full"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${isCentered ? "scale-[1.03] shadow-xl ring-1 ring-brand-green/20" : "shadow-sm"}`}
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
