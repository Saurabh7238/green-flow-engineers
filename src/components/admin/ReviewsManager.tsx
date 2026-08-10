"use client";

import React, { useEffect, useState } from "react";

type ReviewStatus = "pending" | "approved" | "rejected";

type CustomerReview = {
  id: string;
  name: string;
  rating: number;
  review: string;
  status: ReviewStatus;
  createdAt: string;
};

export function ReviewsManager() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("all");
  const [reviewStatusMessage, setReviewStatusMessage] = useState("");

  useEffect(() => {
    void loadReviews(reviewFilter);
  }, [reviewFilter]);

  const loadReviews = async (status: ReviewStatus | "all") => {
    try {
      const response = await fetch(`/api/reviews${status === "all" ? "" : `?status=${status}`}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error(error);
      setReviewStatusMessage("Failed to load reviews.");
    }
  };

  const handleReviewDecision = async (id: string, status: ReviewStatus) => {
    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to update review.");
      setReviewStatusMessage(`Review ${status}.`);
      await loadReviews(reviewFilter);
    } catch (error) {
      console.error(error);
      setReviewStatusMessage(error instanceof Error ? error.message : "Failed to update review.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const response = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete review.");
      setReviewStatusMessage("Review deleted.");
      await loadReviews(reviewFilter);
    } catch (error) {
      console.error(error);
      setReviewStatusMessage(error instanceof Error ? error.message : "Failed to delete review.");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reviews Manager</h2>
          <p className="mt-1 text-sm text-slate-600">Moderate customer reviews before they appear on the site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setReviewFilter(option)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${reviewFilter === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? <p className="text-sm text-slate-600">No reviews found for this view.</p> : null}
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{review.name}</h3>
                <p className="mt-1 text-sm text-slate-600">Rating: {"★".repeat(review.rating)}{review.rating < 5 ? "☆".repeat(5 - review.rating) : ""}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{review.review}</p>
              </div>
              <div className="text-sm text-slate-600 sm:text-right">
                <p className="font-medium text-slate-800">Status: {review.status}</p>
                <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleString()}</time>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {review.status === "pending" ? (
                <>
                  <button type="button" onClick={() => void handleReviewDecision(review.id, "approved")} className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white">
                    Approve
                  </button>
                  <button type="button" onClick={() => void handleReviewDecision(review.id, "rejected")} className="rounded-full bg-amber-600 px-3 py-1 text-sm font-semibold text-white">
                    Reject
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => void handleDeleteReview(review.id)} className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {reviewStatusMessage ? <p className="mt-4 text-sm text-slate-600">{reviewStatusMessage}</p> : null}
    </section>
  );
}
