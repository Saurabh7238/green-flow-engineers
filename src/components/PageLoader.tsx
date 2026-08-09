"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader once page is fully loaded
    const handleLoad = () => {
      setTimeout(() => {
        setIsVisible(false);
        // Re-enable body scroll
        document.body.style.overflow = "";
      }, 500);
    };

    if (document.readyState === "complete") {
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "";
      }, 500);
    } else {
      // Disable body scroll while loading
      document.body.style.overflow = "hidden";
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
        document.body.style.overflow = "";
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background glow elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="absolute -top-32 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />
      </div>

      {/* Company name with blinking glow */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center animate-glow-pulse">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Green Flow
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Engineers
          </span>
        </h1>
      </div>
    </div>
  );
}
