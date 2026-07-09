"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { serviceKeys, type ServiceKey } from "@/data/services";

type SectionItem = { id: string; title: string; description?: string; imageUrl?: string; subtype?: string };
type Section = { id: string; label: string; items: SectionItem[] };
type ServiceContent = { serviceKey: ServiceKey; locale: string; variant?: string; title: string; description: string; imageUrl?: string; sections: Section[] };
type SliderItem = { id: string; sequence: number; mediaType: "image" | "video"; assetUrl: string; headline?: string; actionLink?: string; boundaryClass?: string; aspect?: string };

const SUBTYPE_MAP: Record<string, string[]> = {
  water: ["Water Treatment Plant (WTP)", "Sewage Treatment Plant (STP)", "Effluent Treatment Plant (ETP)", "Industrial RO System"],
  racks: [
    "Pallet Rack / Heavy Duty Rack",
    "Cantilever Rack",
    "FIFO Flow Rack (Gravity Flow)",
    "Mezzanine Floor / Multi-Tier System",
    "Long Span Rack / Medium Duty Rack",
    "Slotted Angle Rack",
    "Supermarket Rack / Display Rack",
    "Mobile Compacter",
  ],
  hvac: ["Industrial Humidification Plant", "Air Handling Unit (AHU)", "Complete HVAC System", "Ventilation & Exhaust System"],
  textile: ["Spinning Unit Equipment", "Weaving Machinery / Looms", "Processing & Finishing Units"],
  fire: [
    "Fire Detection & Alarm Systems (Addressable/VESDA)",
    "Water-Based Suppression (Hydrants/Sprinklers)",
    "Gas-Based Clean Agent Suppression (CO2/FM-200/Novec)",
    "Foam/Passive Fireproofing & Containment",
  ],
  lighting: [
    "Industrial Factory Floor / High Bay Lighting",
    "Commercial Office Recessed & Linear Lighting",
    "Explosion-Proof / Hazardous Zone Lighting",
    "Intelligent Lighting Control Systems (DALI)",
  ],
};

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const VARIANT_MAP: Partial<Record<ServiceKey, Record<string, string>>> = {
  water: {
    "Water Treatment Plant (WTP)": "water-treatment-plant",
    "Sewage Treatment Plant (STP)": "sewage-treatment-plant",
    "Effluent Treatment Plant (ETP)": "effluent-treatment-plant",
    "Industrial RO System": "industrial-ro-system",
  },
};

const resolveVariant = (service: ServiceKey, subtypeValue: string) => VARIANT_MAP[service]?.[subtypeValue] || undefined;

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [serviceKey, setServiceKey] = useState<ServiceKey>("water");
  const [variant, setVariant] = useState<string>("water-treatment-plant");
  const [subtype, setSubtype] = useState<string>(SUBTYPE_MAP["water"][0]);
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [sliderLoading, setSliderLoading] = useState(false);
  const [sliderStatus, setSliderStatus] = useState("");
  const [sliderHeadline, setSliderHeadline] = useState("");
  const [sliderActionLink, setSliderActionLink] = useState("");
  const [sliderMediaType, setSliderMediaType] = useState<"image" | "video">("image");
  const [sliderAssetUrl, setSliderAssetUrl] = useState("");
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  const [sliderPreviewUrl, setSliderPreviewUrl] = useState<string>("");

  useEffect(() => {
    const user = typeof window !== "undefined" && localStorage.getItem("greenflow-current-user");
    if (!user) {
      router.replace(`/en/login`);
      return;
    }
    try {
      const parsed = JSON.parse(user as string);
      if (parsed.role === "admin") setAuthorized(true);
      else router.replace(`/en`);
    } catch (e) {
      router.replace(`/en/login`);
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    loadContent();
    loadSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  useEffect(() => {
    const list = SUBTYPE_MAP[serviceKey];
    if (list && list.length) {
      setSubtype(list[0]);
      const newVariant = resolveVariant(serviceKey, list[0]);
      if (newVariant) setVariant(newVariant);
    }
  }, [serviceKey]);

  useEffect(() => {
    const maybeVariant = resolveVariant(serviceKey, subtype);
    if (maybeVariant) {
      setVariant(maybeVariant);
    } else if (serviceKey !== "water") {
      setVariant("");
    }
  }, [serviceKey, subtype]);

  async function loadContent() {
    setLoading(true);
    try {
      const query = new URLSearchParams({ serviceKey, locale: "en" });
      if (variant) query.set("variant", variant);
      const res = await fetch(`/api/service-content?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setContent(data.data || { serviceKey, locale: "en", variant: variant || undefined, title: "", description: "", sections: [] });
      } else {
        setContent({ serviceKey, locale: "en", variant: variant || undefined, title: "", description: "", sections: [] });
      }
    } catch (err) {
      console.error(err);
      setContent({ serviceKey, locale: "en", variant: variant || undefined, title: "", description: "", sections: [] });
    } finally {
      setLoading(false);
    }
  }

  const validateSubtypeForService = (svc: string, st: string) => {
    const allowed = SUBTYPE_MAP[svc] || [];
    return allowed.includes(st);
  };

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/upload-image", { method: "POST", body: form });
    return res.ok ? await res.json() : null;
  };

  const loadSlides = async () => {
    setSliderLoading(true);
    try {
      const res = await fetch("/api/slider?slider=HOMEPAGE_HERO_SLIDER");
      const data = await res.json();
      if (res.ok && data.success) {
        setSlides(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSliderLoading(false);
    }
  };

  const handleCreateSlide = async () => {
    if (!sliderHeadline.trim()) {
      setSliderStatus("Headline is required.");
      return;
    }

    setSliderLoading(true);
    setSliderStatus("");

    try {
      let assetUrl = sliderAssetUrl.trim();
      if (sliderMediaType === "image" && sliderFile) {
        const up = await uploadImage(sliderFile);
        if (!up?.success) {
          setSliderStatus("Image upload failed.");
          return;
        }
        assetUrl = up.url;
      }

      const response = await fetch("/api/slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slider: "HOMEPAGE_HERO_SLIDER",
          mediaType: sliderMediaType,
          assetUrl,
          headline: sliderHeadline,
          actionLink: sliderActionLink,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setSliderStatus("Failed to add slide.");
        return;
      }

      setSliderHeadline("");
      setSliderActionLink("");
      setSliderAssetUrl("");
      setSliderMediaType("image");
      setSliderFile(null);
      setSliderPreviewUrl("");
      setSliderStatus("Slide added successfully.");
      await loadSlides();
    } catch (err) {
      console.error(err);
      setSliderStatus("Failed to add slide.");
    } finally {
      setSliderLoading(false);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      const response = await fetch(`/api/slider?slider=HOMEPAGE_HERO_SLIDER&id=${slideId}`, { method: "DELETE" });
      if (!response.ok) {
        setSliderStatus("Failed to delete slide.");
        return;
      }
      setSliderStatus("Slide deleted.");
      await loadSlides();
    } catch (err) {
      console.error(err);
      setSliderStatus("Failed to delete slide.");
    }
  };

  const handleAddItem = async (payload: { title: string; short: string; detailed?: string; imageFile?: File }) => {
    setStatus("");
    if (!validateSubtypeForService(serviceKey, subtype)) {
      setStatus("Chosen subtype is not valid for selected service.");
      return false;
    }

    if (!payload.title || !payload.short) {
      setStatus("Title and short description are required.");
      return false;
    }

    let imageUrl = "";
    if (payload.imageFile) {
      const up = await uploadImage(payload.imageFile);
      if (!up?.success) {
        setStatus("Image upload failed");
        return false;
      }
      imageUrl = up.url;
    }

    const newItem: SectionItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: payload.title,
      description: payload.short,
      imageUrl: imageUrl,
      subtype,
    };

    const newContent: ServiceContent = JSON.parse(JSON.stringify(content || { serviceKey, locale: "en", title: "", description: "", sections: [] }));

    // find or create section for the subtype
    const sectionId = `subtype-${slugify(subtype)}`;
    let section = newContent.sections.find((s) => s.id === sectionId);
    if (!section) {
      section = { id: sectionId, label: subtype, items: [] };
      newContent.sections.push(section);
    }
    section.items.push(newItem);

    // persist
    setLoading(true);
    try {
      const res = await fetch(`/api/service-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      });
      if (!res.ok) {
        setStatus("Failed to save service content");
        return false;
      }
      setContent(newContent);
      setStatus(`Item added and saved. Content will appear on the frontend under /en/services/${serviceKey}${variant ? `/${variant}` : ""}.`);
      return true;
    } catch (err) {
      console.error(err);
      setStatus("Failed to save service content");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    if (!confirm("Delete this item?")) return;
    const newContent = JSON.parse(JSON.stringify(content));
    const sec = newContent!.sections.find((s: Section) => s.id === sectionId);
    if (!sec) return;
    sec.items = sec.items.filter((i: SectionItem) => i.id !== itemId);

    // flag if last remaining
    if (sec.items.length === 0) {
      // leave empty section (per user request)
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/service-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      });
      if (!res.ok) {
        setStatus("Failed to save after delete");
        return;
      }
      setContent(newContent);
      setStatus("Item deleted.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to save after delete");
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Admin — Service Content Manager</h1>
      <p className="mt-2 text-sm text-slate-600">Select a service vertical and subtype, then add/edit portfolio items.</p>

      <div className="mt-6 flex gap-3 flex-wrap">
        {serviceKeys.map((k) => (
          <button key={k} onClick={() => setServiceKey(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${serviceKey === k ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
            {k}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Subtype</label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select className="rounded-lg border px-3 py-2" value={subtype} onChange={(e) => setSubtype(e.target.value)}>
            {(SUBTYPE_MAP[serviceKey] || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadContent}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Load slot content
          </button>
        </div>
        {variant ? (
          <p className="mt-2 text-sm text-slate-600">Saving to slot: <strong>{variant}</strong></p>
        ) : null}
      </div>

      <AddItemForm onAdd={handleAddItem} loading={loading} subtype={subtype} />

      <div className="mt-8">
        <div className="mt-4 space-y-6">
          {content?.sections.map((section) => (
            <div key={section.id} className="rounded-2xl border p-4 bg-white">
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {section.items.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3 bg-slate-50">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="mb-2 h-32 w-full object-cover" /> : null}
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleDeleteItem(section.id, item.id)} className="rounded px-3 py-1 text-sm bg-red-100 text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-600">{status}</p>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Homepage Slider Manager</h2>
            <p className="mt-1 text-sm text-slate-600">Upload slides for the homepage hero carousel from here.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="font-semibold">Add New Slide</h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Headline"
                value={sliderHeadline}
                onChange={(e) => setSliderHeadline(e.target.value)}
              />
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Button link (e.g. /en/services)"
                value={sliderActionLink}
                onChange={(e) => setSliderActionLink(e.target.value)}
              />
              <select
                className="w-full rounded border px-3 py-2"
                value={sliderMediaType}
                onChange={(e) => setSliderMediaType(e.target.value as "image" | "video")}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              {sliderMediaType === "image" ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full rounded border px-3 py-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSliderFile(file);
                      setSliderPreviewUrl(file ? URL.createObjectURL(file) : "");
                    }}
                  />
                  {sliderPreviewUrl ? (
                    <img src={sliderPreviewUrl} alt="Preview" className="h-40 w-full rounded object-cover" />
                  ) : null}
                </>
              ) : (
                <input
                  className="w-full rounded border px-3 py-2"
                  placeholder="Video URL or embed URL"
                  value={sliderAssetUrl}
                  onChange={(e) => setSliderAssetUrl(e.target.value)}
                />
              )}

              <button
                onClick={handleCreateSlide}
                disabled={sliderLoading}
                className="rounded bg-brand-green px-4 py-2 font-semibold text-white"
              >
                {sliderLoading ? "Saving..." : "Add slide"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="font-semibold">Existing Slides</h3>
            <div className="mt-4 space-y-3">
              {slides.length === 0 && !sliderLoading ? (
                <p className="text-sm text-slate-600">No slides yet.</p>
              ) : null}
              {slides.map((slide) => (
                <div key={slide.id} className="rounded-lg border bg-white p-3">
                  {slide.assetUrl ? (
                    <img src={slide.assetUrl} alt={slide.headline || "Slide"} className="mb-2 h-24 w-full rounded object-cover" />
                  ) : null}
                  <p className="font-semibold">{slide.headline || "Untitled slide"}</p>
                  <p className="text-sm text-slate-600">{slide.mediaType}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="rounded bg-red-100 px-3 py-1 text-sm text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{sliderStatus}</p>
      </div>
    </div>
  );
}

function AddItemForm({ onAdd, loading, subtype }: { onAdd: (payload: { title: string; short: string; detailed?: string; imageFile?: File }) => Promise<boolean>; loading: boolean; subtype: string }) {
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [detailed, setDetailed] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (file?: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(undefined);
    }
    if (file) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFile(undefined);
    }
  };

  const handleClick = async () => {
    const success = await onAdd({ title, short: shortDesc, detailed, imageFile: file });
    if (!success) return;
    setTitle("");
    setShortDesc("");
    setDetailed("");
    setFile(undefined);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(undefined);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border p-4 bg-slate-50">
      <h3 className="font-semibold">Add new item — {subtype}</h3>
      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="px-3 py-2 rounded border" />
        <input placeholder="Short description" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="px-3 py-2 rounded border" />
      </div>
      <textarea placeholder="Detailed description" value={detailed} onChange={(e) => setDetailed(e.target.value)} className="w-full mt-3 px-3 py-2 rounded border" rows={4} />

      <div className="mt-3">
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0])} className="w-full px-3 py-2 rounded border" />
      </div>
      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
          <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-3">
        <button disabled={loading} onClick={handleClick} className="rounded bg-brand-green px-4 py-2 text-white">
          Add item
        </button>
      </div>
    </div>
  );
}
