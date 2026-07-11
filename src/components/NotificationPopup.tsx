"use client";

import { useEffect, useState } from "react";
import type { Notification } from "@/lib/notification";

const SESSION_KEY = "greenflow-notification-shown";

/**
 * Loads the current active notification once per browser session and renders it
 * as an accessible dialog. It is intentionally mounted in the locale layout so
 * it can appear on every public page.
 */
export function NotificationPopup() {
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // sessionStorage is cleared when the browser session ends. Do not even
    // request notification data again after the popup has been seen.
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const controller = new AbortController();

    async function loadNotification() {
      try {
        const response = await fetch("/api/notifications/active", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json()) as { notification?: Notification | null };
        if (data.notification?.active) {
          // Store this immediately so a refresh cannot show the popup twice.
          sessionStorage.setItem(SESSION_KEY, "true");
          setNotification(data.notification);
        }
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          console.error("Failed to load notification", error);
        }
      }
    }

    void loadNotification();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!notification) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotification(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [notification]);

  if (!notification) return null;

  const close = () => setNotification(null);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={notification.title || "Website notification"}
      onClick={(event) => {
        // Only the backdrop closes the dialog; clicks inside the card do not.
        if (event.target === event.currentTarget) close();
      }}
    >
      <section className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close notification"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-900/80 text-2xl leading-none text-white transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          ×
        </button>

        {notification.image ? (
          <img
            src={notification.image}
            alt=""
            className="h-56 w-full rounded-t-3xl object-cover sm:h-64"
          />
        ) : null}

        {notification.title || notification.message || notification.file ? (
          <div className="p-6 sm:p-8">
            {notification.title ? <h2 className="pr-10 text-2xl font-bold tracking-tight text-slate-900">{notification.title}</h2> : null}
            {notification.message ? <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-600">{notification.message}</p> : null}

            {notification.file ? (
              <a
                href={notification.file}
                download
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-green/90 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
              >
                Download file
              </a>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
