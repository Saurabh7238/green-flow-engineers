"use client";

import { useEffect, useState } from "react";

export function StatsBar() {
  const items = [
    { icon: "📦", value: "50+", label: "Projects Completed" },
    { icon: "👥", value: "100+", label: "Happy Clients" },
    { icon: "🏅", value: "8+", label: "Years Experience" },
    { icon: "👷", value: "35+", label: "Expert Team" },
    { icon: "⏰", value: "24x7", label: "Customer Support" },
  ];
  const targets = [50, 100, 8, 35, 24];
  const [counts, setCounts] = useState(() => targets.map(() => 0));

  useEffect(() => {
    const duration = 900;
    const startedAt = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setCounts(targets.map((target) => Math.max(1, Math.floor(target * progress))));
      if (progress < 1) frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <section className="py-0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-5 items-center gap-1 text-center sm:gap-4 md:gap-4">
          {items.map((it, index) => (
            <div key={it.label} className="flex min-w-0 flex-col items-center gap-1 rounded-lg p-1 text-center sm:gap-2 sm:p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-base sm:h-12 sm:w-12 sm:text-2xl">{it.icon}</div>
              <div className="text-sm font-bold text-slate-900 sm:mt-1 sm:text-lg">{it.value.replace(/^\d+/, String(counts[index]))}</div>
              <div className="text-[9px] font-medium leading-tight text-slate-600 sm:text-xs">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
