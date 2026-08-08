"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { serviceKeys } from "@/data/services";

type ContactFormProps = {
  variant?: "default" | "popup";
};

type CurrentUser = {
  username: string;
  name?: string;
  email?: string;
  mobile?: string;
};

const currentUserStorageKey = "greenflow-current-user";

export function ContactForm({ variant = "default" }: ContactFormProps) {
  const t = useTranslations("contact.form");
  const tItems = useTranslations("services.items");
  const locale = useLocale();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const syncCurrentUser = () => {
      try {
        const savedUser = window.localStorage.getItem(currentUserStorageKey);
        setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setCurrentUser(null);
      }
    };

    syncCurrentUser();
    window.addEventListener("auth:changed", syncCurrentUser);
    return () => window.removeEventListener("auth:changed", syncCurrentUser);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Login required to send an enquiry.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          message: formData.get("message"),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to submit enquiry");
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-brand-green-dark"
      >
        {t("success")}
      </div>
    );
  }

  const isPopup = variant === "popup";
  const fieldClassName = isPopup
    ? "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
    : "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

  return (
    <form key={currentUser?.username ?? "guest"} onSubmit={handleSubmit} className={isPopup ? "space-y-3" : "space-y-4"}>
      <div>
        {!isPopup && <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">{t("name")}</label>}
        <input
          id="name"
          name="name"
          type="text"
          required={Boolean(currentUser)}
          defaultValue={currentUser?.name || currentUser?.username || ""}
          placeholder={isPopup ? t("name") : undefined}
          className={fieldClassName}
        />
      </div>
      <div className={isPopup ? "space-y-3" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          {!isPopup && <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">{t("email")}</label>}
          <input
            id="email"
            name="email"
            type="email"
            required={Boolean(currentUser)}
            defaultValue={currentUser?.email || ""}
            placeholder={isPopup ? t("email") : undefined}
            className={fieldClassName}
          />
        </div>
        <div>
          {!isPopup && <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">{t("phone")}</label>}
          <input
            id="phone"
            name="phone"
            type="tel"
            required={Boolean(currentUser)}
            defaultValue={currentUser?.mobile || ""}
            placeholder={isPopup ? t("phone") : undefined}
            className={fieldClassName}
          />
        </div>
      </div>
      <div>
        {!isPopup && <label htmlFor="service" className="mb-1 block text-sm font-medium text-slate-700">{t("service")}</label>}
        <select
          id="service"
          name="service"
          required={Boolean(currentUser)}
          defaultValue=""
          className={fieldClassName}
        >
          <option value="" disabled>
            {t("selectService")}
          </option>
          {serviceKeys.map((key) => (
            <option key={key} value={key}>
              {tItems(`${key}.title`)}
            </option>
          ))}
        </select>
      </div>
      <div>
        {!isPopup && <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">{t("message")}</label>}
        <textarea
          id="message"
          name="message"
          rows={isPopup ? 3 : 5}
          required={Boolean(currentUser)}
          placeholder={isPopup ? t("message") : undefined}
          className={fieldClassName}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className={isPopup ? "w-full rounded-xl bg-brand-green py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-brand-green-dark" : "w-full rounded-lg bg-brand-green py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark sm:w-auto sm:px-8"}
      >
        {submitting ? "Sending..." : t("submit")}
      </button>
      {error ? (
        <div role="alert" className="text-sm text-red-600">
          <p>{error}</p>
          {!currentUser ? <Link href={`/${locale}/login?returnTo=${encodeURIComponent(window.location.pathname)}`} className="mt-1 inline-block font-semibold text-brand-green-dark hover:underline">Log in now</Link> : null}
        </div>
      ) : null}
    </form>
  );
}
