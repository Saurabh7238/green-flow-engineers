"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { siteConfig } from "@/lib/site";

export function MobileActionBar() {
  const locale = useLocale();

  return (
    <nav
      aria-label="Quick contact actions"
      className="fixed inset-x-0 bottom-0 z-[200] grid grid-cols-3 gap-x-2 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_12px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <a href={siteConfig.phoneHref} className="flex min-h-[40px] flex-col items-center justify-center rounded-lg bg-brand-green text-xs font-semibold text-white shadow-sm transition hover:bg-brand-green-dark">
        <span aria-hidden="true" className="text-base leading-none">☎</span>
        <span className="mt-1">Call Now</span>
      </a>
      <Link href={`/${locale}/enquiry`} className="flex min-h-[40px] flex-col items-center justify-center rounded-lg bg-brand-green text-xs font-semibold text-white shadow-sm transition hover:bg-brand-green-dark">
        <span aria-hidden="true" className="text-base leading-none">✉</span>
        <span className="mt-1">Enquiry</span>
      </Link>
      <a href="https://wa.me/919628434151" target="_blank" rel="noreferrer" className="flex min-h-[40px] flex-col items-center justify-center rounded-lg bg-brand-green text-xs font-semibold text-white shadow-sm transition hover:bg-brand-green-dark">
        <span aria-hidden="true" className="text-base leading-none">◉</span>
        <span className="mt-1">WhatsApp</span>
      </a>
    </nav>
  );
}
