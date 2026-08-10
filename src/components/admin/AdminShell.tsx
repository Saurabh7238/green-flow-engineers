"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const adminPages = [
  { href: "/admin/content-manager", label: "Service content manager" },
  { href: "/admin/gallery", label: "Gallery manager" },
  { href: "/admin/notifications", label: "Popup notification manager" },
  { href: "/admin/slider", label: "Homepage slider manager" },
  { href: "/admin/reviews", label: "Reviews manager" },
  { href: "/admin/enquiries", label: "Enquiries manager" },
];

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminShell({ title, description, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const currentUser = typeof window !== "undefined" ? localStorage.getItem("greenflow-current-user") : null;
    if (!currentUser) {
      router.replace("/en/login");
      return;
    }
    try {
      const parsed = JSON.parse(currentUser);
      if (parsed.role !== "admin") {
        router.replace("/en");
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace("/en/login");
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin menu</p>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <aside className={`lg:block ${menuOpen ? "block" : "hidden"} w-full lg:w-72 shrink-0`}>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin menu</p>
          <div className="mt-4 space-y-2">
            {adminPages.map((page) => {
              const active = pathname === page.href;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border border-brand-green bg-brand-green/10 text-brand-green"
                      : "border border-slate-200 bg-white text-slate-800 hover:border-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {page.label}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
            <Link href="/en" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View site
            </Link>
          </div>
        </div>

        <div>{children}</div>
      </main>
    </div>
  );
}
