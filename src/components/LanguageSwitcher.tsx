"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (next: string) => {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  };

  return (
    <div className="no-print flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-sm font-medium">
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`rounded-md px-3 py-1 transition ${
          locale === "en"
            ? "bg-white text-brand-green-dark shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale("hi")}
        className={`rounded-md px-3 py-1 transition ${
          locale === "hi"
            ? "bg-white text-brand-green-dark shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
        aria-pressed={locale === "hi"}
      >
        हिं
      </button>
    </div>
  );
}
