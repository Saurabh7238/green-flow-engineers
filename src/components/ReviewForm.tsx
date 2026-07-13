"use client";

import { useState } from "react";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      let uploadedPhotoUrl = photoUrl.trim();
      if (photoFile) {
        const formData = new FormData();
        formData.append("image", photoFile);
        const uploadResponse = await fetch("/api/upload-image", { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadData?.success) {
          setStatus(uploadData?.error || "Image upload failed.");
          return;
        }
        uploadedPhotoUrl = uploadData.url;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, review, photoUrl: uploadedPhotoUrl }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus(data.error || "Unable to submit review right now.");
        return;
      }

      setName("");
      setRating(5);
      setReview("");
      setPhotoUrl("");
      setPhotoFile(null);
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
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Your name"
                />
              </div>

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
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Share your experience"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Photo upload (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <input
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Or paste a photo URL"
                />
              </div>

              <button type="submit" disabled={loading} className="rounded-lg bg-brand-green px-4 py-2 font-semibold text-white disabled:opacity-60">
                {loading ? "Submitting..." : "Submit review"}
              </button>
            </div>

            {submitted || status ? (
              <p className={`mt-4 text-sm ${submitted ? "text-emerald-700" : "text-slate-600"}`}>
                {status || "Thank you! Your review is pending admin approval."}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
