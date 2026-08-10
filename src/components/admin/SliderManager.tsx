"use client";

import React, { useEffect, useState } from "react";

type SliderItem = {
  id: string;
  sequence: number;
  mediaType: "image" | "video";
  assetUrl: string;
  headline?: string;
  actionLink?: string;
  boundaryClass?: string;
  aspect?: string;
};

const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_UPLOAD_DIMENSION = 1600;

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

export function SliderManager() {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [sliderLoading, setSliderLoading] = useState(false);
  const [sliderStatus, setSliderStatus] = useState("");
  const [sliderHeadline, setSliderHeadline] = useState("");
  const [sliderActionLink, setSliderActionLink] = useState("");
  const [sliderMediaType, setSliderMediaType] = useState<"image" | "video">("image");
  const [sliderVideoSource, setSliderVideoSource] = useState<"link" | "gallery">("link");
  const [sliderAssetUrl, setSliderAssetUrl] = useState("");
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  const [sliderPreviewUrl, setSliderPreviewUrl] = useState<string>("");

  useEffect(() => {
    void loadSlides();
  }, []);

  const loadSlides = async () => {
    setSliderLoading(true);
    try {
      const response = await fetch("/api/slider?slider=HOMEPAGE_HERO_SLIDER");
      const data = await response.json();
      if (response.ok && data.success) {
        setSlides(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSliderLoading(false);
    }
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

  const uploadFile = async (file: File) => {
    const CHUNK_SIZE = 2 * 1024 * 1024;
    const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      for (let i = 0; i < totalChunks; i += 1) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const slice = file.slice(start, end);
        const formData = new FormData();
        formData.append("chunk", slice, file.name);
        formData.append("sessionId", sessionId);
        formData.append("index", String(i));
        formData.append("filename", file.name);
        formData.append("contentType", file.type || "application/octet-stream");

        const response = await fetch("/api/upload-file/chunk", { method: "POST", body: formData });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          return { success: false, error: data?.error || "Failed to upload chunk" };
        }
      }

      const completeResponse = await fetch("/api/upload-file/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, filename: file.name }),
      });
      const completeData = await completeResponse.json();
      if (!completeResponse.ok || !completeData?.success) {
        return { success: false, error: completeData?.error || "Failed to assemble upload" };
      }
      return { success: true, url: completeData.url };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const handleCreateSlide = async () => {
    setSliderLoading(true);
    setSliderStatus("");

    try {
      let assetUrl = sliderAssetUrl.trim();
      if (sliderMediaType === "image" && sliderFile) {
        const upload = await uploadImage(sliderFile);
        if (!upload?.success) {
          setSliderStatus(upload?.error || "Image upload failed.");
          return;
        }
        assetUrl = upload.url;
      }

      if (sliderMediaType === "video" && sliderVideoSource === "gallery") {
        if (!sliderFile) {
          setSliderStatus("Select a video file or choose link mode.");
          return;
        }
        const upload = await uploadFile(sliderFile);
        if (!upload?.success) {
          setSliderStatus(upload?.error || "Video upload failed.");
          return;
        }
        assetUrl = upload.url;
      }

      if (sliderMediaType === "video" && sliderVideoSource === "link" && !assetUrl) {
        setSliderStatus("Video URL or embed link is required.");
        return;
      }

      const response = await fetch("/api/slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slider: "HOMEPAGE_HERO_SLIDER",
          mediaType: sliderMediaType,
          assetUrl,
          headline: sliderHeadline.trim() || undefined,
          actionLink: sliderActionLink.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setSliderStatus(data?.error || "Failed to add slide.");
        return;
      }

      setSliderHeadline("");
      setSliderActionLink("");
      setSliderAssetUrl("");
      setSliderMediaType("image");
      setSliderVideoSource("link");
      setSliderFile(null);
      setSliderPreviewUrl("");
      setSliderStatus("Slide added successfully.");
      await loadSlides();
    } catch (error) {
      console.error(error);
      setSliderStatus(error instanceof Error ? error.message : "Failed to add slide.");
    } finally {
      setSliderLoading(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      const response = await fetch(`/api/slider?slider=HOMEPAGE_HERO_SLIDER&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        setSliderStatus("Failed to delete slide.");
        return;
      }
      setSliderStatus("Slide deleted.");
      await loadSlides();
    } catch (error) {
      console.error(error);
      setSliderStatus("Failed to delete slide.");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Homepage Slider Manager</h2>
          <p className="mt-1 text-sm text-slate-600">Upload homepage slides and manage the hero carousel.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-semibold">Add New Slide</h3>
          <div className="mt-4 space-y-3">
            <input value={sliderHeadline} onChange={(event) => setSliderHeadline(event.target.value)} placeholder="Headline (optional)" className="w-full rounded-lg border px-3 py-2" />
            <input value={sliderActionLink} onChange={(event) => setSliderActionLink(event.target.value)} placeholder="Button link (optional)" className="w-full rounded-lg border px-3 py-2" />
            <select value={sliderMediaType} onChange={(event) => setSliderMediaType(event.target.value as "image" | "video")} className="w-full rounded-lg border px-3 py-2">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            {sliderMediaType === "image" ? (
              <>
                <input type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSliderFile(file);
                  setSliderPreviewUrl(file ? URL.createObjectURL(file) : "");
                }} className="w-full rounded-lg border px-3 py-2" />
                {sliderPreviewUrl ? <img src={sliderPreviewUrl} alt="Preview" className="mt-3 h-40 w-full rounded-2xl object-cover" /> : null}
              </>
            ) : (
              <>
                <select value={sliderVideoSource} onChange={(event) => setSliderVideoSource(event.target.value as "link" | "gallery")} className="w-full rounded-lg border px-3 py-2">
                  <option value="link">Video link</option>
                  <option value="gallery">Upload from gallery</option>
                </select>
                {sliderVideoSource === "gallery" ? (
                  <>
                    <input type="file" accept="video/*" onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setSliderFile(file);
                      setSliderPreviewUrl(file ? file.name : "");
                    }} className="w-full rounded-lg border px-3 py-2" />
                    {sliderFile ? <p className="mt-2 text-sm text-slate-600">Selected video: {sliderFile.name}</p> : null}
                  </>
                ) : (
                  <input value={sliderAssetUrl} onChange={(event) => setSliderAssetUrl(event.target.value)} placeholder="Video URL or embed URL" className="w-full rounded-lg border px-3 py-2" />
                )}
              </>
            )}

            <button type="button" onClick={handleCreateSlide} disabled={sliderLoading} className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {sliderLoading ? "Saving..." : "Add slide"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-semibold">Existing Slides</h3>
          <div className="mt-4 space-y-3">
            {slides.length === 0 && !sliderLoading ? <p className="text-sm text-slate-600">No slides yet.</p> : null}
            {slides.map((slide) => (
              <div key={slide.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                {slide.assetUrl ? <img src={slide.assetUrl} alt={slide.headline || "Slide"} className="mb-3 h-28 w-full rounded object-cover" /> : null}
                <p className="font-semibold text-slate-900">{slide.headline || "Untitled slide"}</p>
                <p className="mt-1 text-sm text-slate-600">Type: {slide.mediaType}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleDeleteSlide(slide.id)} className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {sliderStatus ? <p className="mt-4 text-sm text-slate-600">{sliderStatus}</p> : null}
    </section>
  );
}
