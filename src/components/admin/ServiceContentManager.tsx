"use client";

import React, { useEffect, useState } from "react";
import { serviceKeys, type ServiceKey } from "@/data/services";
import { getSlotVariant } from "@/lib/content-slot";

type ServiceContentItem = {
  id: string;
  vertical_tab: ServiceKey;
  subtype: string;
  title: string;
  description_short: string;
  description_detailed?: string;
  media_type: "image" | "video";
  media_url: string;
  action_link: string;
};

type ServiceContent = {
  serviceKey: ServiceKey;
  locale: string;
  variant?: string;
  title: string;
  description: string;
  imageUrl?: string;
  items: ServiceContentItem[];
};

type AddItemPayload = {
  title: string;
  short: string;
  detailed?: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  actionLink: string;
  imageFile?: File;
};

type SectionItem = { id: string; title: string; description?: string; imageUrl?: string; alt?: string; subtype?: string };
type Section = { id: string; label: string; items: SectionItem[] };

type VariantMap = Partial<Record<ServiceKey, Record<string, string>>>;

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

const VARIANT_MAP: VariantMap = {
  water: {
    "Water Treatment Plant (WTP)": "water-treatment-plant",
    "Sewage Treatment Plant (STP)": "sewage-treatment-plant",
    "Effluent Treatment Plant (ETP)": "effluent-treatment-plant",
    "Industrial RO System": "industrial-ro-system",
  },
};

const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveVariant = (service: ServiceKey, subtypeValue: string) => VARIANT_MAP[service]?.[subtypeValue] || undefined;

const compressImageFile = async (file: File) => {
  if (!file.type.startsWith("image/")) return file;

  const imageBitmap = await createImageBitmap(file);
  const { width, height } = imageBitmap;
  const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(width, height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    imageBitmap.close?.();
    return file;
  }

  context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  imageBitmap.close?.();

  const mimeType = file.type === "image/png" ? "image/webp" : file.type === "image/gif" ? "image/webp" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), mimeType, 0.82);
  });

  if (!blob) return file;
  const outputFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: mimeType });
  return outputFile.size <= file.size ? outputFile : file;
};

export function ServiceContentManager() {
  const [serviceKey, setServiceKey] = useState<ServiceKey>("water");
  const [subtype, setSubtype] = useState<string>(SUBTYPE_MAP["water"][0]);
  const [variant, setVariant] = useState<string>(resolveVariant("water", SUBTYPE_MAP["water"][0]) || "");
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const available = SUBTYPE_MAP[serviceKey] || [];
    setSubtype(available[0]);
    const defaultVariant = getSlotVariant(serviceKey, available[0]);
    setVariant(defaultVariant || resolveVariant(serviceKey, available[0]) || "");
  }, [serviceKey]);

  useEffect(() => {
    const maybeVariant = getSlotVariant(serviceKey, subtype) || resolveVariant(serviceKey, subtype);
    setVariant(maybeVariant || "");
  }, [serviceKey, subtype]);

  useEffect(() => {
    void loadContent();
  }, [serviceKey, subtype, variant]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const activeVariant = getSlotVariant(serviceKey, subtype) || variant || undefined;
      const query = new URLSearchParams({ serviceKey, locale: "en" });
      if (activeVariant) query.set("variant", activeVariant);
      const response = await fetch(`/api/service-content?${query.toString()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setContent(
          data.data || {
            serviceKey,
            locale: "en",
            variant: activeVariant,
            title: "",
            description: "",
            items: [],
          },
        );
      } else {
        setContent({ serviceKey, locale: "en", variant: activeVariant, title: "", description: "", items: [] });
      }
    } catch (error) {
      console.error(error);
      setContent({ serviceKey, locale: "en", variant: variant || undefined, title: "", description: "", items: [] });
    } finally {
      setLoading(false);
    }
  };

  const validateSubtypeForService = (svc: string, st: string) => {
    return (SUBTYPE_MAP[svc] || []).includes(st);
  };

  const uploadImage = async (file: File) => {
    const preparedFile = file.size > MAX_UPLOAD_SIZE_BYTES ? await compressImageFile(file) : file;
    if (preparedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      return { success: false, error: `Image must be smaller than ${Math.round(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))} MB` };
    }

    const formData = new FormData();
    formData.append("image", preparedFile);
    const response = await fetch("/api/upload-image", { method: "POST", body: formData });
    if (!response.ok) {
      let errorMessage = "Image upload failed";
      try {
        const data = await response.json();
        if (data?.error) errorMessage = data.error;
      } catch {
        // ignore invalid JSON
      }
      return { success: false, error: errorMessage };
    }

    return response.ok ? await response.json() : { success: false, error: "Image upload failed" };
  };

  const handleAddItem = async (payload: AddItemPayload) => {
    setStatus("");
    if (!validateSubtypeForService(serviceKey, subtype)) {
      setStatus("Chosen subtype is not valid for selected service.");
      return false;
    }

    if (!payload.title.trim() || !payload.short.trim()) {
      setStatus("Title and short description are required.");
      return false;
    }
    if (payload.mediaType === "video" && !payload.mediaUrl.trim()) {
      setStatus("Video URL is required for video media type.");
      return false;
    }
    if (payload.mediaType === "image" && !payload.mediaUrl.trim() && !payload.imageFile) {
      setStatus("Image file or image URL is required for image media type.");
      return false;
    }

    let mediaUrl = payload.mediaUrl.trim();
    if (payload.mediaType === "image" && payload.imageFile) {
      const upload = await uploadImage(payload.imageFile);
      if (!upload?.success || !upload.url) {
        setStatus(upload?.error || "Image upload failed");
        return false;
      }
      mediaUrl = upload.url;
    }

    const activeVariant = getSlotVariant(serviceKey, subtype) || variant || undefined;
    const newItem: ServiceContentItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      vertical_tab: serviceKey,
      subtype,
      title: payload.title.trim(),
      description_short: payload.short.trim(),
      description_detailed: payload.detailed?.trim() || "",
      media_type: payload.mediaType,
      media_url: mediaUrl,
      action_link: payload.actionLink.trim() || "#",
    };

    const nextContent: ServiceContent = {
      serviceKey,
      locale: "en",
      variant: activeVariant,
      title: content?.title || "",
      description: content?.description || "",
      items: [...(content?.items || []), newItem],
    };

    setLoading(true);
    try {
      const response = await fetch(`/api/service-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextContent),
      });
      if (!response.ok) {
        setStatus("Failed to save service content.");
        return false;
      }
      setContent(nextContent);
      setStatus(`Item added and saved. Content will appear under /en/services/${serviceKey}${activeVariant ? `/${activeVariant}` : ""}.`);
      return true;
    } catch (error) {
      console.error(error);
      setStatus("Failed to save service content.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item: ServiceContentItem) => {
    if (!confirm(`Delete this item from ${item.subtype}?`)) return;
    const newContent = { ...content, items: (content?.items || []).filter((i) => i.id !== item.id) } as ServiceContent;
    setLoading(true);
    try {
      const query = new URLSearchParams({ serviceKey, locale: "en", itemId: item.id });
      if (variant) query.set("variant", variant);
      const response = await fetch(`/api/service-content?${query.toString()}`, { method: "DELETE" });
      if (!response.ok) {
        setStatus("Failed to delete item from service content.");
        return;
      }
      setContent(newContent);
      setStatus("Item deleted.");
    } catch (error) {
      console.error(error);
      setStatus("Failed to delete item from service content.");
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = (content?.items || []).reduce<Record<string, ServiceContentItem[]>>((acc, item) => {
    acc[item.subtype] = acc[item.subtype] || [];
    acc[item.subtype].push(item);
    return acc;
  }, {});

  const resolveMediaUrl = (value: string) => {
    if (!value) return "";
    if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value;
    if (typeof window !== "undefined") {
      return value.startsWith("/") ? `${window.location.origin}${value}` : `${window.location.origin}/${value}`;
    }
    return value;
  };

  const currentVariant = getSlotVariant(serviceKey, subtype) || variant || "";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Service Content Manager</h2>
            <p className="mt-1 text-sm text-slate-600">Manage service portfolios and slot content by vertical and subtype.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Service vertical</label>
              <select value={serviceKey} onChange={(event) => setServiceKey(event.target.value as ServiceKey)} className="mt-2 w-full rounded-lg border px-3 py-2">
                {serviceKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Subtype</label>
              <select value={subtype} onChange={(event) => setSubtype(event.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2">
                {(SUBTYPE_MAP[serviceKey] || []).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={loadContent} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Reload content
            </button>
            {currentVariant ? <p className="text-sm text-slate-600">Saving to slot: <strong>{currentVariant}</strong></p> : null}
          </div>
          <AddItemForm onAdd={handleAddItem} loading={loading} subtype={subtype} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Existing content</h3>
        <p className="mt-2 text-sm text-slate-600">Review and delete saved service items for the selected service and subtype.</p>

        <div className="mt-6 space-y-6">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">No items found for this slot yet.</div>
          ) : null}
          {Object.entries(groupedItems).map(([subtypeLabel, items]) => (
            <div key={subtypeLabel} className="rounded-2xl border p-4 bg-slate-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{subtypeLabel}</h4>
                  <p className="text-sm text-slate-600">{items.length} item{items.length === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {item.media_type === "video" ? (
                      <video src={resolveMediaUrl(item.media_url)} className="h-48 w-full object-cover" controls />
                    ) : (
                      <img src={resolveMediaUrl(item.media_url)} alt={item.title} className="h-48 w-full object-cover" />
                    )}
                    <div className="p-4">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.description_short}</p>
                      <a href={item.action_link || "#"} className="mt-3 inline-flex text-sm font-semibold text-brand-green">
                        View projects →
                      </a>
                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={() => handleDeleteItem(item)} className="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
      </div>
    </section>
  );
}

const MAX_UPLOAD_DIMENSION = 1600;

function AddItemForm({ onAdd, loading, subtype }: { onAdd: (payload: AddItemPayload) => Promise<boolean>; loading: boolean; subtype: string }) {
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [detailed, setDetailed] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [actionLink, setActionLink] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (selectedFile?: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(undefined);
      setPreviewUrl(undefined);
    }
  };

  const handleSubmit = async () => {
    const success = await onAdd({
      title,
      short: shortDesc,
      detailed,
      mediaType,
      mediaUrl,
      actionLink,
      imageFile: file,
    });
    if (!success) return;

    setTitle("");
    setShortDesc("");
    setDetailed("");
    setMediaUrl("");
    setActionLink("");
    setFile(undefined);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(undefined);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-xl font-semibold">Add new item — {subtype}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="rounded-lg border px-3 py-2" />
        <input value={shortDesc} onChange={(event) => setShortDesc(event.target.value)} placeholder="Short description" className="rounded-lg border px-3 py-2" />
      </div>
      <textarea value={detailed} onChange={(event) => setDetailed(event.target.value)} placeholder="Detailed description" className="mt-4 w-full rounded-lg border px-3 py-2" rows={4} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <select value={mediaType} onChange={(event) => setMediaType(event.target.value as "image" | "video")} className="rounded-lg border px-3 py-2">
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <input value={actionLink} onChange={(event) => setActionLink(event.target.value)} placeholder="Action link" className="rounded-lg border px-3 py-2" />
      </div>
      {mediaType === "video" ? (
        <div className="mt-4">
          <input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="Video URL" className="w-full rounded-lg border px-3 py-2" />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">
              Upload image (optional)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
                className="mt-2 w-full rounded-lg border px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-4">
            <input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="Image URL (optional)" className="w-full rounded-lg border px-3 py-2" />
          </div>
        </>
      )}
      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
          <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover" />
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add item"}
      </button>
    </div>
  );
}
