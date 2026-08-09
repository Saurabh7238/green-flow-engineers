"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

type CurrentUser = {
  username: string;
  name?: string;
};

const currentUserStorageKey = "greenflow-current-user";

export function ReviewForm() {
  const locale = useLocale();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem(currentUserStorageKey);
      setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) {
      setSubmitted(false);
      setStatus("Login required to submit a review.");
      return;
    }
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentUser.name || currentUser.username, rating, review }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus(data.error || "Unable to submit review right now.");
        return;
      }

      setRating(5);
      setReview("");
      
      setSubmitted(true);
      setStatus("Thank you! Your review is pending admin approval.");
    } catch (error) {
      console.error(error);
      setStatus("Unable to submit review right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-green">Share your experience</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Write a review</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Tell us about your experience with Green Flow Engineers. Reviews are reviewed by our team before appearing publicly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rating</label>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Review</label>
                <textarea
                  required
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Share your experience"
                />
              </div>

              {/* image and URL inputs removed */}

              <button type="submit" disabled={loading} className="rounded-lg bg-brand-green px-4 py-2 font-semibold text-white disabled:opacity-60">
                {loading ? "Submitting..." : "Submit review"}
              </button>
            </div>

            {submitted || status ? (
              <div className={`mt-4 text-sm ${submitted ? "text-emerald-700" : "text-slate-600"}`}>
                <p>{status || "Thank you! Your review is pending admin approval."}</p>
                {!currentUser && status ? <Link href={`/${locale}/login?returnTo=${encodeURIComponent("/" + locale)}`} className="mt-1 inline-block font-semibold text-brand-green-dark hover:underline">Log in now</Link> : null}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
