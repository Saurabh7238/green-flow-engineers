"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { siteConfig } from "@/lib/site";

export function MobileActionBar() {
  const locale = useLocale();

  return (
    <nav
      aria-label="Quick contact actions"
      className="fixed inset-x-0 bottom-0 z-[200] grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_16px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <a href={siteConfig.phoneHref} className="flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
        <span aria-hidden="true" className="text-base leading-none">☎</span>
        <span className="mt-1">Call Now</span>
      </a>
      <Link href={`/${locale}/enquiry`} className="flex min-h-12 flex-col items-center justify-center rounded-lg bg-brand-green text-xs font-semibold text-white shadow-sm transition hover:bg-brand-green-dark">
        <span aria-hidden="true" className="text-base leading-none">✉</span>
        <span className="mt-1">Enquiry</span>
      </Link>
      <a href="https://wa.me/919628434151" target="_blank" rel="noreferrer" className="flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
        <span aria-hidden="true" className="text-base leading-none">◉</span>
        <span className="mt-1">WhatsApp</span>
      </a>
    </nav>
  );
}
