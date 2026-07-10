"use client";

import { useEffect, useState } from "react";
import type { CustomerQuote } from "@/lib/quotes";

type QuotesSectionProps = {
  title: string;
  subtitle: string;
};

export function QuotesSection({ title, subtitle }: QuotesSectionProps) {
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);

  useEffect(() => {
    fetch("/api/quotes")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed to load quotes"))))
      .then((data) => setQuotes(Array.isArray(data.data) ? data.data : []))
      .catch(() => setQuotes([]));
  }, []);

  if (quotes.length === 0) return null;

  return (
    <section className="bg-emerald-50/60 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green">{subtitle}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((item) => (
            <figure key={item.id} className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <blockquote className="text-slate-700 leading-relaxed">“{item.quote}”</blockquote>
              <figcaption className="mt-5 border-t border-slate-100 pt-4">
                <p className="font-semibold text-slate-900">{item.author}</p>
                {item.designation ? <p className="mt-1 text-sm text-slate-500">{item.designation}</p> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
