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
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="[&_span]:text-white [&_.text-brand-green-dark]:text-emerald-400">
            <Logo locale={locale} size="sm" />
          </div>
          <p className="mt-3 text-sm text-slate-400">{tMeta("tagline")}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            {t("quickLinks")}
          </h3>
          <ul className="space-y-2 text-sm">
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
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            {t("contactInfo")}
          </h3>
          <ul className="space-y-2 text-sm">
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

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Green Flow Engineers. {t("rights")}
      </div>
    </footer>
  );
}
