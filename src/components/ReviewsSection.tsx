"use client";

import { useEffect, useMemo, useState } from "react";
import type { CustomerReview } from "@/lib/reviews";

type Props = {
  title?: string;
  subtitle?: string;
};

export function ReviewsSection({ title = "What our clients say", subtitle = "Trusted by customers across industries" }: Props) {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/reviews?status=approved")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed to load reviews"))))
      .then((data) => {
        if (!mounted) return;
        setReviews(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setReviews([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [reviews.length, isPaused]);

  const activeReview = useMemo(() => reviews[activeIndex] || null, [reviews, activeIndex]);

  const changeReview = (direction: 1 | -1) => {
    if (reviews.length <= 1) return;
    setActiveIndex((current) => (current + direction + reviews.length) % reviews.length);
  };

  if (!activeReview) return null;

  return (
    <section className="bg-slate-50/70 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green">{subtitle}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
        </div>

        <div
          className="mt-10 overflow-hidden rounded-[28px] border border-emerald-100 bg-white/90 p-4 shadow-[0_20px_60px_-24px_rgba(16,24,40,0.2)] sm:p-6 lg:p-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative mx-auto max-w-4xl">
            <button
              type="button"
              onClick={() => changeReview(-1)}
              className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
              aria-label="Previous review"
            >
              ←
            </button>

            <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-4 py-6 sm:px-8 sm:py-8">
              <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {reviews.map((review) => (
                  <div key={review.id} className="min-w-full">
                    <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
                      <div className="max-w-2xl">
                        <div className="flex justify-center gap-1 text-amber-500 lg:justify-start" aria-label={`Rating ${review.rating} out of 5`}>
                          {Array.from({ length: 5 }, (_, idx) => (
                            <span key={idx} className={idx < review.rating ? "text-amber-500" : "text-slate-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="mt-4 text-lg leading-relaxed text-slate-700">“{review.review}”</p>
                        <p className="mt-4 font-semibold text-slate-900">{review.name}</p>
                      </div>

                      {review.photoUrl ? (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:w-48">
                          <img src={review.photoUrl} alt={review.name} className="h-40 w-full rounded-xl object-cover" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => changeReview(1)}
              className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
              aria-label="Next review"
            >
              →
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {reviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-brand-green" : "w-2.5 bg-slate-300"}`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
