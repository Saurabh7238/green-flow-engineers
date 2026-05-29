"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navItems = ["home", "services", "gallery", "blog", "about", "contact"] as const;

export function Header() {
  const t = useTranslations("nav");
  const tCta = useTranslations("cta");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const href = (key: typeof navItems[number]) => {
    const paths: Record<typeof navItems[number], string> = {
      home: `/${locale}`,
      services: `/${locale}/services`,
      gallery: `/${locale}/gallery`,
      blog: `/${locale}/blog`,
      about: `/${locale}/about`,
      contact: `/${locale}/contact`,
    };
    return paths[key];
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo locale={locale} />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navItems.map((key) => (
            <Link
              key={key}
              href={href(key)}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-green-dark"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/contact`}
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
          >
            {tCta("contact")}
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {navItems.map((key) => (
              <Link
                key={key}
                href={href(key)}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-slate-700"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <LanguageSwitcher />
            <Link
              href={`/${locale}/contact`}
              onClick={() => setOpen(false)}
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white"
            >
              {tCta("contact")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
