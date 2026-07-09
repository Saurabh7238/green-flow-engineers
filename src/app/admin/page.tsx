"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { serviceKeys, type ServiceKey } from "@/data/services";

const defaultValues = {
  heroTitle: "",
  heroSubtitle: "",
  introTitle: "",
  introText: "",
  aboutVision: "",
  aboutMission: "",
  contactAddress: "",
  phone: "",
  email: "",
};

const defaultServiceContent = (serviceKey: ServiceKey) => ({
  serviceKey,
  locale: "en",
  title: "",
  description: "",
  imageUrl: "",
  sections: [] as {
    id: string;
    label: string;
    items: { id: string; title: string; description: string; imageUrl: string }[];
  }[],
});

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultValues);
  const [status, setStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceKey>("water");
  const [serviceContent, setServiceContent] = useState(defaultServiceContent("water"));
  const [serviceLoading, setServiceLoading] = useState(false);

  useEffect(() => {
    const currentUser = window.localStorage.getItem("greenflow-current-user");
    if (!currentUser) {
      router.replace(`/en/login`);
      setAuthChecked(true);
      return;
    }

    const parsed = JSON.parse(currentUser);
    if (parsed.role !== "admin") {
      router.replace(`/en`);
      setAuthChecked(true);
      return;
    }

    setIsAuthorized(true);
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    const loadData = async () => {
      const res = await fetch("/api/site-content");
      const data = await res.json();
      setForm({ ...defaultValues, ...(data?.data || {}) });
      setStatus("Loaded content from database.");
      setLoading(false);
    };

    loadData();
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    const loadService = async () => {
      setServiceLoading(true);
      const res = await fetch(`/api/service-content?serviceKey=${selectedService}&locale=en`);
      const data = await res.json();
      if (data?.success && data.data) {
        setServiceContent({
          ...defaultServiceContent(selectedService),
          ...data.data,
          sections: data.data.sections || [],
        });
      } else {
        setServiceContent(defaultServiceContent(selectedService));
      }
      setServiceLoading(false);
    };

    loadService();
  }, [isAuthorized, selectedService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving...");

    const res = await fetch("/api/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: form }),
    });

    if (res.ok) {
      setStatus("Saved successfully.");
    } else {
      setStatus("Failed to save.");
    }
  };

  const handleServiceFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setServiceContent({ ...serviceContent, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (sectionId: string, field: string, value: string) => {
    setServiceContent({
      ...serviceContent,
      sections: serviceContent.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    });
  };

  const handleSectionItemChange = (sectionId: string, itemId: string, field: string, value: string) => {
    setServiceContent({
      ...serviceContent,
      sections: serviceContent.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
            }
          : section,
      ),
    });
  };

  const addSection = () => {
    setServiceContent({
      ...serviceContent,
      sections: [
        ...serviceContent.sections,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          label: "New section",
          items: [],
        },
      ],
    });
  };

  const removeSection = (sectionId: string) => {
    setServiceContent({
      ...serviceContent,
      sections: serviceContent.sections.filter((section) => section.id !== sectionId),
    });
  };

  const addSectionItem = (sectionId: string) => {
    setServiceContent({
      ...serviceContent,
      sections: serviceContent.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                  title: "New item",
                  description: "",
                  imageUrl: "",
                },
              ],
            }
          : section,
      ),
    });
  };

  const removeSectionItem = (sectionId: string, itemId: string) => {
    setServiceContent({
      ...serviceContent,
      sections: serviceContent.sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section,
      ),
    });
  };

  const saveServiceContent = async () => {
    setStatus("Saving service content...");
    const res = await fetch("/api/service-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceContent),
    });

    if (res.ok) {
      setStatus("Service content saved.");
    } else {
      setStatus("Failed to save service content.");
    }
  };

  if (!authChecked) {
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
          <p className="mt-2 text-slate-600">You must be logged in as an admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage homepage, services, and content from here.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedService("water")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedService === "water" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Water
          </button>
          <button
            type="button"
            onClick={() => setSelectedService("racks")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedService === "racks" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Racks
          </button>
          <button
            type="button"
            onClick={() => setSelectedService("hvac")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedService === "hvac" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            HVAC
          </button>
          <button
            type="button"
            onClick={() => setSelectedService("textile")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedService === "textile" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Textile
          </button>
          <button
            type="button"
            onClick={() => setSelectedService("fire")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedService === "fire" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Fire
          </button>
          <button
            type="button"
            onClick={() => setSelectedService("lighting")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedService === "lighting" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Lighting
          </button>
        </div>
      </div>

      <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Service Management</h2>
          <p className="text-sm text-slate-600">Select a service to manage its image, description, and service sections.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
            <input
              name="title"
              value={serviceContent.title}
              onChange={handleServiceFieldChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Image URL</span>
            <input
              name="imageUrl"
              value={serviceContent.imageUrl}
              onChange={handleServiceFieldChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            value={serviceContent.description}
            onChange={handleServiceFieldChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Sections</h3>
            <button
              type="button"
              onClick={addSection}
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white"
            >
              Add section
            </button>
          </div>

          <div className="space-y-6">
            {serviceContent.sections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <input
                    name="label"
                    value={section.label}
                    onChange={(e) => handleSectionChange(section.id, "label", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Item Title</span>
                          <input
                            value={item.title}
                            onChange={(e) => handleSectionItemChange(section.id, item.id, "title", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Image URL</span>
                          <input
                            value={item.imageUrl}
                            onChange={(e) => handleSectionItemChange(section.id, item.id, "imageUrl", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleSectionItemChange(section.id, item.id, "description", e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSectionItem(section.id, item.id)}
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700"
                      >
                        Remove item
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSectionItem(section.id)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Add item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">{serviceLoading ? "Loading service content..." : status}</p>
          <button
            type="button"
            onClick={saveServiceContent}
            disabled={serviceLoading}
            className="rounded-lg bg-brand-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save service content
          </button>
        </div>
      </div>
    </div>
  );
}
