"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { siteConfig } from "@/lib/site";

export function MobileActionBar() {
  const locale = useLocale();

  return (
    <>
      <nav
        aria-label="Quick contact actions"
        className="fixed inset-x-0 bottom-0 z-[200] grid grid-cols-3 gap-2 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_18px_rgba(15,23,42,0.12)] backdrop-blur"
      >
        <a href={siteConfig.phoneHref} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-green px-3 text-sm font-semibold text-white shadow-sm shadow-brand-green/15 transition duration-200 hover:bg-brand-green-dark hover:-translate-y-px motion-safe:hover:scale-[1.01] motion-safe:animate-pulse">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15 text-base leading-none">☎</span>
          <span>Call</span>
        </a>
        <Link href={`/${locale}/enquiry`} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-green px-3 text-sm font-semibold text-white shadow-sm shadow-brand-green/15 transition duration-200 hover:bg-brand-green-dark hover:-translate-y-px motion-safe:hover:scale-[1.01] motion-safe:animate-pulse">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15 text-base leading-none">✉</span>
          <span>Enquiry</span>
        </Link>
        <a href="https://wa.me/919628434151" target="_blank" rel="noreferrer" aria-label="WhatsApp chat" className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand-green px-3 text-sm font-semibold text-white shadow-sm shadow-brand-green/15 transition duration-200 hover:bg-brand-green-dark hover:-translate-y-px motion-safe:hover:scale-[1.01] motion-safe:animate-pulse">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15 text-base leading-none">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
              <path d="M20.52 3.48A11.94 11.94 0 0012.003.5C6.468.5 1.9 5.06 1.9 10.6c0 1.86.5 3.69 1.47 5.3L.5 23.5l7.8-2.02a10.96 10.96 0 004.7 1.03h.01c5.54 0 10.1-4.57 10.1-10.1 0-2.7-1.05-5.24-2.81-7.03zM12 20.82a9.98 9.98 0 01-4.45-1.04l-.32-.18-4.64 1.2 1.24-4.53-.21-.37A8.03 8.03 0 013.9 10.6c0-4.44 3.62-8.05 8.1-8.05 2.16 0 4.18.84 5.71 2.37a7.98 7.98 0 012.33 5.68c0 4.44-3.62 8.05-8.08 8.05zm4.44-6.24c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.17.24-.66.78-.8.95-.15.17-.3.19-.55.07-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.37.1-.49.1-.1.24-.26.36-.4.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.07-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.55-.4-.14 0-.3-.01-.46-.01-.15 0-.4.05-.61.24-.22.2-.84.82-.84 2 .01 1.19.86 2.34.98 2.5.12.17 1.7 2.6 4.12 3.64.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.17-.46-.29z"/>
            </svg>
          </span>
          <span>WhatsApp</span>
        </a>
      </nav>
    </>
  );
}
