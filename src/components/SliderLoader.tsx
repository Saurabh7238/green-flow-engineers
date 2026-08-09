"use client";

export function SliderLoader() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Loader content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Animated bars loader */}
        <div className="flex items-end gap-2 h-12">
          <div className="w-1.5 h-3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full animate-pulse" style={{ animationDuration: "1.5s", animationDelay: "0s" }} />
          <div className="w-1.5 h-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full animate-pulse" style={{ animationDuration: "1.5s", animationDelay: "0.2s" }} />
          <div className="w-1.5 h-8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full animate-pulse" style={{ animationDuration: "1.5s", animationDelay: "0.4s" }} />
          <div className="w-1.5 h-5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full animate-pulse" style={{ animationDuration: "1.5s", animationDelay: "0.6s" }} />
          <div className="w-1.5 h-7 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full animate-pulse" style={{ animationDuration: "1.5s", animationDelay: "0.8s" }} />
        </div>

        {/* Loading text */}
        <p className="text-sm font-medium text-slate-600 mt-2">Loading slider...</p>
      </div>
    </div>
  );
}
