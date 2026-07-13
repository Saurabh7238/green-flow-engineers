"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/ContactForm";
import { Logo } from "@/components/Logo";

export function EnquiryPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.endsWith("/enquiry")) return;

    const timer = window.setTimeout(() => setOpen(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!open || pathname.endsWith("/enquiry")) return null;

  const locale = pathname.split("/")[1] || "en";

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-popup-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section className="relative max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close enquiry form"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-900/10 text-2xl leading-none text-slate-700 transition hover:bg-slate-900/20 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          ×
        </button>
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="relative hidden min-h-full overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-9 lg:block">
            <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-brand-green/10" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand-blue/10" />
            <div className="relative flex h-full flex-col">
              <Logo locale={locale} size="lg" />
              <div className="my-auto py-12">
                <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-brand-green text-4xl text-white shadow-lg">✦</div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">Let&apos;s build better.</p>
                <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">Share your requirement and the Green Flow Engineers team will get back to you shortly.</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-dark">Engineering solutions that flow</p>
            </div>
          </aside>
          <div className="p-6 sm:p-8 lg:p-9">
            <div className="mb-6 pr-9 lg:hidden"><Logo locale={locale} size="sm" /></div>
            <h2 id="enquiry-popup-title" className="text-2xl font-bold tracking-tight text-slate-900">Send an Enquiry</h2>
            <p className="mt-2 text-sm text-slate-600">Tell us what you need and our team will contact you.</p>
            <div className="mt-6"><ContactForm variant="popup" /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
