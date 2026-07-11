"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ContactForm } from "@/components/ContactForm";

export function EnquiryPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.endsWith("/enquiry")) return;

    const timer = window.setTimeout(() => setOpen(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!open || pathname.endsWith("/enquiry")) return null;

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
      <section className="relative max-h-[55vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-orange-200 bg-orange-50 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close enquiry form"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-orange-600 text-xl leading-none text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          ×
        </button>
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 pr-12 text-white sm:p-5 sm:pr-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Green Flow Engineers</p>
          <h2 id="enquiry-popup-title" className="mt-1 text-xl font-bold">Send an Enquiry</h2>
          <p className="mt-2 text-sm text-orange-50">Tell us what you need and our team will contact you.</p>
        </div>
        <div className="p-4 sm:p-5">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
