"use client";

import { useEffect, useState } from "react";
import type { SliderItem } from "@/lib/slider";

export function HomeSlider() {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("/api/slider?slider=HOMEPAGE_HERO_SLIDER");
        if (!res.ok) throw new Error("Failed to fetch slides");
        const data = await res.json();
        setSlides(data.data || []);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % Math.max(slides.length, 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="aspect-[3/2] w-full bg-slate-200 animate-pulse flex items-center justify-center">
        <p className="text-slate-600">Loading slider...</p>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="aspect-[3/2] w-full bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">No slides configured</p>
      </div>
    );
  }

  const activeSlide = slides[current];

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-black">
      {/* Slide Container */}
      <div className="relative w-full h-full">
        {activeSlide.mediaType === "image" ? (
          <img
            src={activeSlide.assetUrl}
            alt={activeSlide.headline || "Slide"}
            className={activeSlide.boundaryClass || "w-full h-full object-cover"}
          />
        ) : (
          <video
            src={activeSlide.assetUrl}
            autoPlay
            muted
            loop
            playsInline
            className={activeSlide.boundaryClass || "w-full h-full object-cover"}
          />
        )}

        {/* Overlay Content */}
        {activeSlide.headline && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center px-4 mb-4">
              {activeSlide.headline}
            </h1>
            {activeSlide.actionLink && (
              <a
                href={activeSlide.actionLink}
                className="bg-brand-green text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
              >
                Learn More
              </a>
            )}
          </div>
        )}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition ${
              idx === current ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition"
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
  );
}
