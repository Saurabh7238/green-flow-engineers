import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tMeta = await getTranslations("meta");
  const locale = await getLocale();

  const address =
    locale === "hi" ? siteConfig.address.hi : siteConfig.address.en;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 pb-16 text-slate-300 sm:pb-20">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8 md:grid-cols-3">
        <div>
          <div className="[&_span]:text-white [&_.text-brand-green-dark]:text-emerald-400">
            <Logo locale={locale} size="sm" />
          </div>
          <p className="mt-2 text-sm text-slate-400">{tMeta("tagline")}</p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
            {t("quickLinks")}
          </h3>
          <ul className="space-y-1.5 text-sm sm:space-y-2">
            {(["services", "gallery", "blog", "about", "contact"] as const).map((key) => (
              <li key={key}>
                <Link
                  href={`/${locale}/${key}`}
                  className="hover:text-emerald-400 transition"
                >
                  {tNav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
            {t("contactInfo")}
          </h3>
          <ul className="space-y-1.5 text-sm sm:space-y-2">
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-emerald-400">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={siteConfig.emailHref} className="hover:text-emerald-400">
                {siteConfig.email}
              </a>
            </li>
            <li className="text-slate-400">{address}</li>
          </ul>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center gap-2 border-t border-slate-700 bg-slate-900/95 px-4 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.25)] backdrop-blur sm:gap-3 sm:px-6 sm:py-4">
        <a
          href={siteConfig.phoneHref}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-600 px-2 py-2 text-xs font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-400 sm:flex-none sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 4.5c0 9.113 7.387 16.5 16.5 16.5h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a13.5 13.5 0 01-6.69-6.69l1.293-.97c.348-.26.5-.71.417-1.173L9.794 3.602A1.125 1.125 0 008.703 2.75H7.5A2.25 2.25 0 005.25 5v.75" />
          </svg>
          Call Now
        </a>
        <Link
          href={`/${locale}/enquiry`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-600 px-2 py-2 text-xs font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-400 sm:flex-none sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5m-7.5 0L10.5 9.75M8.25 12l2.25 2.25M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Enquiry
        </Link>
        <a
          href="https://wa.me/919628434151?text=Hello%20Green%20Flow%20Engineers%2C%20I%20would%20like%20to%20make%20an%20enquiry."
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-green px-2 py-2 text-xs font-semibold text-white transition hover:bg-brand-green-dark sm:flex-none sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 014 11.5a8.5 8.5 0 014.7-7.6A8.38 8.38 0 0112.5 3h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          WhatsApp
        </a>
      </div>

      <div className="border-t border-slate-800 py-2 text-center text-xs text-slate-500 sm:py-3">
        © {new Date().getFullYear()} Green Flow Engineers. {t("rights")}
      </div>
    </footer>
  );
}
