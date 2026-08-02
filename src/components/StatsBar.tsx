"use client";

import React from "react";

export function StatsBar() {
  const items = [
    { icon: "📦", value: "50+", label: "Projects Completed" },
    { icon: "👥", value: "100+", label: "Happy Clients" },
    { icon: "🏅", value: "8+", label: "Years Experience" },
    { icon: "👷", value: "35+", label: "Expert Team" },
    { icon: "⏰", value: "24x7", label: "Customer Support" },
  ];

  return (
    <section className="bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 items-center text-center">
          {items.map((it) => (
            <div key={it.label} className="flex flex-col items-center gap-2 rounded-lg p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">{it.icon}</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{it.value}</div>
              <div className="text-xs font-medium text-slate-600">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
