"use client";

import React, { useEffect, useState } from "react";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
};

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryStatus, setEnquiryStatus] = useState("");

  useEffect(() => {
    void loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      const response = await fetch("/api/enquiries");
      const data = await response.json();
      if (response.ok && data.success) {
        setEnquiries(data.data || []);
      }
    } catch (error) {
      console.error(error);
      setEnquiryStatus("Failed to load enquiries.");
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    try {
      const response = await fetch(`/api/enquiries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete enquiry.");
      setEnquiryStatus("Enquiry deleted.");
      await loadEnquiries();
    } catch (error) {
      console.error(error);
      setEnquiryStatus(error instanceof Error ? error.message : "Failed to delete enquiry.");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Enquiries Manager</h2>
          <p className="mt-1 text-sm text-slate-600">View and delete contact form submissions from site visitors.</p>
        </div>
        <button type="button" onClick={loadEnquiries} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">
          Refresh
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {enquiries.length === 0 ? <p className="text-sm text-slate-600">No enquiries received yet.</p> : null}
        {enquiries.map((enquiry) => (
          <article key={enquiry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{enquiry.name}</h3>
                <a href={`mailto:${enquiry.email}`} className="mt-1 block text-sm text-brand-green hover:underline">
                  {enquiry.email}
                </a>
                <a href={`tel:${enquiry.phone.replace(/[^+\d]/g, "")}`} className="block text-sm text-brand-green hover:underline">
                  {enquiry.phone}
                </a>
              </div>
              <div className="text-sm text-slate-600 sm:text-right">
                <p className="font-medium text-slate-800">{enquiry.service}</p>
                <time dateTime={enquiry.createdAt}>{new Date(enquiry.createdAt).toLocaleString()}</time>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{enquiry.message}</p>
            <button type="button" onClick={() => handleDeleteEnquiry(enquiry.id)} className="mt-4 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              Delete
            </button>
          </article>
        ))}
      </div>
      {enquiryStatus ? <p className="mt-4 text-sm text-slate-600">{enquiryStatus}</p> : null}
    </section>
  );
}
