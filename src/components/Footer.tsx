import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site";
import { serviceKeys } from "@/data/services";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tMeta = await getTranslations("meta");
  const tServices = await getTranslations("services.items");
  const locale = await getLocale();

  const address =
    locale === "hi" ? siteConfig.address.hi : siteConfig.address.en;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 pb-20 text-slate-300 sm:pb-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-7 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-3">
        <div className="col-span-1 min-w-0 space-y-3 sm:space-y-4 lg:col-span-1">
          <div className="[&_span]:text-white [&_.text-brand-green-dark]:text-emerald-400">
            <Logo locale={locale} size="sm" />
          </div>
          <p className="text-sm text-slate-400">{tMeta("tagline")}</p>
          <div className="flex items-center gap-3 text-slate-400">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">
              FB
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white">
              LI
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
              IG
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="hover:text-white">
              YT
            </a>
          </div>
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{t("contactInfo")}</h3>
          <ul className="space-y-1.5 text-sm text-slate-300 sm:space-y-2">
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-emerald-400 break-words">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={siteConfig.emailHref} className="hover:text-emerald-400 break-words">
                {siteConfig.email}
              </a>
            </li>
            <li className="text-slate-400 break-words">{address}</li>
          </ul>
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{tNav("services")}</h3>
          <ul className="space-y-1.5 text-sm text-slate-300 sm:space-y-2">
            {serviceKeys.slice(0, 5).map((key) => (
              <li key={key}>
                <Link href={`/${locale}/services/${key}`} className="hover:text-emerald-400 transition break-words">
                  {tServices(`${key}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-2 text-center text-xs text-slate-500 sm:py-3">
        © {new Date().getFullYear()} Green Flow Engineers. {t("rights")}
      </div>
    </footer>
  );
}
