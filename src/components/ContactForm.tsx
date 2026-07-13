"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { serviceKeys } from "@/data/services";

type ContactFormProps = {
  variant?: "default" | "popup";
};

export function ContactForm({ variant = "default" }: ContactFormProps) {
  const t = useTranslations("contact.form");
  const tItems = useTranslations("services.items");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit} className={isPopup ? "space-y-3" : "space-y-4"}>
      <div>
        {!isPopup && <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">{t("name")}</label>}
        <input
          id="name"
          name="name"
          type="text"
          required
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
            required
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
            required
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
          required
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
          required
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
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
