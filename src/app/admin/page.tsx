"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { serviceKeys, type ServiceKey } from "@/data/services";
import { getSlotVariant } from "@/lib/content-slot";
import { GalleryManager } from "@/components/GalleryManager";

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

type SectionItem = { id: string; title: string; description?: string; imageUrl?: string; alt?: string; subtype?: string };
type Section = { id: string; label: string; items: SectionItem[] };
type ServiceContent = { serviceKey: ServiceKey; locale: string; variant?: string; title: string; description: string; imageUrl?: string; items: ServiceContentItem[]; sections?: Section[] };
type SliderItem = { id: string; sequence: number; mediaType: "image" | "video"; assetUrl: string; headline?: string; actionLink?: string; boundaryClass?: string; aspect?: string };
type CustomerQuote = { id: string; quote: string; author: string; designation?: string };
type AdminNotification = { id: string; title: string; message: string; image?: string; file?: string; active: boolean; expiresAt?: string | null };
type Enquiry = { id: string; name: string; email: string; phone: string; service: string; message: string; createdAt: string };
type ReviewStatus = "pending" | "approved" | "rejected";
type CustomerReview = { id: string; name: string; rating: number; review: string; photoUrl?: string; status: ReviewStatus; createdAt: string };

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
  const [sliderVideoSource, setSliderVideoSource] = useState<"link" | "gallery">("link");
  const [sliderAssetUrl, setSliderAssetUrl] = useState("");
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  const [sliderPreviewUrl, setSliderPreviewUrl] = useState<string>("");
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [quoteDesignation, setQuoteDesignation] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState("");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewStatusMessage, setReviewStatusMessage] = useState("");
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("all");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationImage, setNotificationImage] = useState("");
  const [notificationFile, setNotificationFile] = useState("");
  const [notificationImageFile, setNotificationImageFile] = useState<File | null>(null);
  const [notificationAttachment, setNotificationAttachment] = useState<File | null>(null);
  const [notificationActive, setNotificationActive] = useState(true);
  const [notificationExpiresAt, setNotificationExpiresAt] = useState("");
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryStatus, setEnquiryStatus] = useState("");

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
    loadQuotes();
    loadNotifications();
    loadEnquiries();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;
    void loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, serviceKey, subtype, variant]);

  useEffect(() => {
    const list = SUBTYPE_MAP[serviceKey];
    if (list && list.length) {
      setSubtype(list[0]);
      const newVariant = getSlotVariant(serviceKey, list[0]);
      if (newVariant) setVariant(newVariant);
    }
  }, [serviceKey]);

  useEffect(() => {
    const maybeVariant = getSlotVariant(serviceKey, subtype);
    if (maybeVariant) {
      setVariant(maybeVariant);
    } else {
      setVariant("");
    }
  }, [serviceKey, subtype]);

  async function loadContent() {
    setLoading(true);
    try {
      const activeVariant = getSlotVariant(serviceKey, subtype) || variant || undefined;
      const query = new URLSearchParams({ serviceKey, locale: "en" });
      if (activeVariant) query.set("variant", activeVariant);
      const res = await fetch(`/api/service-content?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
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
    } catch (err) {
      console.error(err);
      setContent({ serviceKey, locale: "en", variant: variant || undefined, title: "", description: "", items: [] });
    } finally {
      setLoading(false);
    }
  }

  const validateSubtypeForService = (svc: string, st: string) => {
    const allowed = SUBTYPE_MAP[svc] || [];
    return allowed.includes(st);
  };

  const uploadImage = async (file: File) => {
    const preparedFile = file.size > MAX_UPLOAD_SIZE_BYTES ? await compressImageFile(file) : file;
    if (preparedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      return { success: false, error: `Image must be smaller than ${Math.round(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))} MB` };
    }

    const form = new FormData();
    form.append("image", preparedFile);
    const res = await fetch("/api/upload-image", { method: "POST", body: form });

    if (!res.ok) {
      let errorMessage = "Image upload failed";
      try {
        const data = await res.json();
        if (data?.error) errorMessage = data.error;
      } catch {
        // Ignore invalid JSON and use the fallback message.
      }
      return { success: false, error: errorMessage };
    }

    return res.ok ? await res.json() : null;
  };

  const uploadFile = async (file: File) => {
    // Use presigned S3 upload to avoid sending large multipart bodies to serverless functions
    // Use chunked upload to GridFS for MongoDB storage to avoid function payload limits
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
    const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const blob = file.slice(start, end);
        const form = new FormData();
        form.append("chunk", blob, file.name);
        form.append("sessionId", sessionId);
        form.append("index", String(i));
        form.append("filename", file.name);
        form.append("contentType", file.type || "application/octet-stream");

        const res = await fetch("/api/upload-file/chunk", { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err?.error || "Failed to upload chunk" };
        }
      }

      const completeRes = await fetch("/api/upload-file/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, filename: file.name }),
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok || !completeData?.success) return { success: false, error: completeData?.error || "Failed to assemble upload" };
      return { success: true, url: completeData.url };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
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

  const loadQuotes = async () => {
    try {
      const response = await fetch("/api/quotes");
      const data = await response.json();
      if (response.ok && data.success) setQuotes(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (response.ok && data.success) setNotifications(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadEnquiries = async () => {
    try {
      const response = await fetch("/api/enquiries");
      const data = await response.json();
      if (response.ok && data.success) setEnquiries(data.data || []);
    } catch (error) {
      console.error(error);
      setEnquiryStatus("Failed to load enquiries.");
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews${reviewFilter === "all" ? "" : `?status=${reviewFilter}`}`);
      const data = await response.json();
      if (response.ok && data.success) setReviews(data.data || []);
    } catch (error) {
      console.error(error);
      setReviewStatusMessage("Failed to load reviews.");
    }
  };

  const handleReviewDecision = async (id: string, status: ReviewStatus) => {
    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to update review.");
      setReviewStatusMessage(`Review ${status}.`);
      await loadReviews();
    } catch (error) {
      console.error(error);
      setReviewStatusMessage(error instanceof Error ? error.message : "Failed to update review.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const response = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete review.");
      setReviewStatusMessage("Review deleted.");
      await loadReviews();
    } catch (error) {
      console.error(error);
      setReviewStatusMessage(error instanceof Error ? error.message : "Failed to delete review.");
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
      setEnquiryStatus("Failed to delete enquiry.");
    }
  };

  const resetNotificationForm = () => {
    setNotificationId(null);
    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationImage("");
    setNotificationFile("");
    setNotificationImageFile(null);
    setNotificationAttachment(null);
    setNotificationActive(true);
    setNotificationExpiresAt("");
  };

  const uploadNotificationFile = async (file: File) => {
    try {
      const pres = await fetch("/api/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const presData = await pres.json();
      if (!pres.ok || !presData?.url) return { success: false, error: presData?.error || "Failed to get upload URL" };

      const putRes = await fetch(presData.url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) return { success: false, error: "Failed to upload file to storage" };

      return { success: true, url: presData.publicUrl };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  };

  const saveNotification = async () => {
    setNotificationLoading(true);
    setNotificationStatus("");
    try {
      let image = notificationImage.trim();
      let file = notificationFile.trim();
      if (notificationImageFile) {
        const upload = await uploadImage(notificationImageFile);
        if (!upload?.success || !upload.url) throw new Error(upload?.error || "Image upload failed.");
        image = upload.url;
      }
      if (notificationAttachment) {
        const upload = await uploadNotificationFile(notificationAttachment);
        if (!upload.success || !upload.url) throw new Error(upload.error || "File upload failed.");
        file = upload.url;
      }

      const response = await fetch("/api/notifications", {
        method: notificationId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        // End of the selected local date makes “show until” inclusive for admins.
        body: JSON.stringify({ id: notificationId || undefined, title: notificationTitle, message: notificationMessage, image, file, active: notificationActive, expiresAt: notificationExpiresAt ? new Date(`${notificationExpiresAt}T23:59:59.999`).toISOString() : null }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save notification.");

      resetNotificationForm();
      setNotificationStatus("Notification saved.");
      await loadNotifications();
    } catch (error) {
      setNotificationStatus(error instanceof Error ? error.message : "Failed to save notification.");
    } finally {
      setNotificationLoading(false);
    }
  };

  const editNotification = (notification: AdminNotification) => {
    setNotificationId(notification.id);
    setNotificationTitle(notification.title);
    setNotificationMessage(notification.message);
    setNotificationImage(notification.image || "");
    setNotificationFile(notification.file || "");
    setNotificationImageFile(null);
    setNotificationAttachment(null);
    setNotificationActive(notification.active);
    setNotificationExpiresAt(notification.expiresAt ? notification.expiresAt.slice(0, 10) : "");
    setNotificationStatus("");
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      const response = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete notification.");
      if (notificationId === id) resetNotificationForm();
      setNotificationStatus("Notification deleted.");
      await loadNotifications();
    } catch (error) {
      setNotificationStatus(error instanceof Error ? error.message : "Failed to delete notification.");
    }
  };

  const handleCreateQuote = async () => {
    if (!quoteText.trim() || !quoteAuthor.trim()) {
      setQuoteStatus("Quote and customer name are required.");
      return;
    }

    setQuoteLoading(true);
    setQuoteStatus("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: quoteText, author: quoteAuthor, designation: quoteDesignation }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setQuoteStatus(data.error || "Failed to add customer quote.");
        return;
      }
      setQuoteText("");
      setQuoteAuthor("");
      setQuoteDesignation("");
      setQuoteStatus("Customer quote added.");
      await loadQuotes();
    } catch (error) {
      console.error(error);
      setQuoteStatus("Failed to add customer quote.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm("Delete this customer quote?")) return;
    try {
      const response = await fetch(`/api/quotes?id=${encodeURIComponent(quoteId)}`, { method: "DELETE" });
      if (!response.ok) {
        setQuoteStatus("Failed to delete customer quote.");
        return;
      }
      setQuoteStatus("Customer quote deleted.");
      await loadQuotes();
    } catch (error) {
      console.error(error);
      setQuoteStatus("Failed to delete customer quote.");
    }
  };

  const handleCreateSlide = async () => {
    setSliderLoading(true);
    setSliderStatus("");

    try {
      let assetUrl = sliderAssetUrl.trim();
      if (sliderMediaType === "image" && sliderFile) {
        const up = await uploadImage(sliderFile);
        if (!up?.success) {
          setSliderStatus(up?.error || "Image upload failed.");
          return;
        }
        assetUrl = up.url;
      }

        if (sliderMediaType === "video" && sliderVideoSource === "gallery") {
          if (!sliderFile) {
            setSliderStatus("Select a video file from gallery or switch to link mode.");
            return;
          }
          const up = await uploadFile(sliderFile);
          if (!up?.success) {
            setSliderStatus(up?.error || "Video upload failed.");
            return;
          }
          assetUrl = up.url;
        }

        if (sliderMediaType === "video" && sliderVideoSource === "link" && !assetUrl) {
          setSliderStatus("Video URL or embed link is required.");
          return;
        }

      const res = await fetch("/api/slider", {
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
      const data = await res.json();
      if (!res.ok || !data.success) {
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

  const handleAddItem = async (payload: {
    title: string;
    short: string;
    detailed?: string;
    mediaType: "image" | "video";
    mediaUrl: string;
    actionLink: string;
    imageFile?: File;
  }) => {
    setStatus("");
    if (!validateSubtypeForService(serviceKey, subtype)) {
      setStatus("Chosen subtype is not valid for selected service.");
      return false;
    }

    if (!payload.title || !payload.short) {
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
      const up = await uploadImage(payload.imageFile);
      if (!up?.success) {
        setStatus(up?.error || "Image upload failed");
        return false;
      }
      mediaUrl = up.url;
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

    const newContent: ServiceContent = JSON.parse(
      JSON.stringify(content || { serviceKey, locale: "en", variant: activeVariant, title: "", description: "", items: [] }),
    );
    newContent.serviceKey = serviceKey;
    newContent.locale = "en";
    newContent.variant = activeVariant;
    newContent.items = newContent.items || [];
    newContent.items.push(newItem);

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
      setStatus(`Item added and saved. Content will appear on the frontend under /en/services/${serviceKey}${activeVariant ? `/${activeVariant}` : ""}.`);
      return true;
    } catch (err) {
      console.error(err);
      setStatus("Failed to save service content");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item: ServiceContentItem) => {
    if (!confirm(`[CRITICAL ALERT] Deleting this record will clear 1 card slot from the live grid under subtype: ${item.subtype}. Proceed?`)) return;
    const newContent = JSON.parse(JSON.stringify(content));
    if (!newContent?.items) return;
    newContent.items = newContent.items.filter((i: ServiceContentItem) => i.id !== item.id);

    setLoading(true);
    try {
      const query = new URLSearchParams({ serviceKey, locale: "en" });
      if (variant) query.set("variant", variant);
      query.set("itemId", item.id);
      const res = await fetch(`/api/service-content?${query.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setStatus("Failed to delete item from service content");
        return;
      }
      setContent(newContent);
      setStatus("Item deleted.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete item from service content");
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = (content?.items || []).reduce<Record<string, ServiceContentItem[]>>((acc, item) => {
    const key = item.subtype || "Unknown";
    acc[key] = acc[key] || [];
    acc[key].push(item);
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

  if (!authorized) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Admin — Service Content Manager</h1>
      <p className="mt-2 text-sm text-slate-600">Select a service vertical and subtype, then add/edit portfolio items.</p>

      <GalleryManager />

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
          {Object.keys(groupedItems).length === 0 ? (
            <div className="rounded-2xl border p-6 bg-white text-slate-600">No items found for this slot yet.</div>
          ) : null}
          {Object.entries(groupedItems).map(([subtypeLabel, items]) => (
            <div key={subtypeLabel} className="rounded-2xl border p-4 bg-white">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-900">{subtypeLabel}</h3>
                <span className="text-sm text-slate-500">{items.length} card slot{items.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-3 bg-slate-50"
                    data-category={item.vertical_tab}
                    data-subtype={item.subtype}
                  >
                    {item.media_type === "video" ? (
                      <video
                        src={item.media_url}
                        className="w-full h-48 sm:h-56 object-cover object-center"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={resolveMediaUrl(item.media_url)}
                        alt={item.title}
                        className="w-full h-48 sm:h-56 object-cover object-center clip-bounds layout-equalizer"
                      />
                    )}
                    <p className="mt-3 font-semibold line-clamp-1">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 h-16">{item.description_short}</p>
                    <a href={item.action_link || "#"} className="mt-3 inline-flex text-sm font-semibold text-brand-green">
                      View projects →
                    </a>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="rounded px-3 py-1 text-sm bg-red-100 text-red-700"
                      >
                        Delete
                      </button>
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
        <h2 className="text-2xl font-semibold">Popup Notification Manager</h2>
        <p className="mt-1 text-sm text-slate-600">Create and manage the one-time popup shown to website visitors. Only one notification can be active at a time.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
            <input className="w-full rounded border px-3 py-2" placeholder="Notification title (optional)" value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} />
            <textarea className="min-h-28 w-full rounded border px-3 py-2" placeholder="Notification message (optional)" value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Image URL (optional)" value={notificationImage} onChange={(event) => setNotificationImage(event.target.value)} />
            <label className="block text-sm font-medium text-slate-700">
              Upload image (optional)
              <input type="file" accept="image/*" className="mt-1 block w-full rounded border bg-white px-3 py-2" onChange={(event) => setNotificationImageFile(event.target.files?.[0] || null)} />
            </label>
            <input className="w-full rounded border px-3 py-2" placeholder="Download file URL (optional)" value={notificationFile} onChange={(event) => setNotificationFile(event.target.value)} />
            <label className="block text-sm font-medium text-slate-700">
              Upload download file (optional, max 10 MB)
              <input type="file" className="mt-1 block w-full rounded border bg-white px-3 py-2" onChange={(event) => setNotificationAttachment(event.target.files?.[0] || null)} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={notificationActive} onChange={(event) => setNotificationActive(event.target.checked)} />
              Active — show this popup to visitors
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Show until (optional)
              <input type="date" className="mt-1 block w-full rounded border bg-white px-3 py-2" value={notificationExpiresAt} onChange={(event) => setNotificationExpiresAt(event.target.value)} />
              <span className="mt-1 block text-xs font-normal text-slate-500">The notification remains active through the end of this date.</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={saveNotification} disabled={notificationLoading} className="rounded bg-brand-green px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {notificationLoading ? "Saving..." : notificationId ? "Update notification" : "Create notification"}
              </button>
              {notificationId ? <button type="button" onClick={resetNotificationForm} className="rounded bg-slate-200 px-4 py-2 font-semibold text-slate-800">Cancel edit</button> : null}
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="font-semibold">Saved Notifications</h3>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? <p className="text-sm text-slate-600">No notifications created yet.</p> : null}
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{notification.title}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${notification.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {notification.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.message}</p>
                  {notification.expiresAt ? <p className="mt-2 text-xs text-slate-500">Expires: {new Date(notification.expiresAt).toLocaleDateString()}</p> : <p className="mt-2 text-xs text-slate-500">No expiry date</p>}
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => editNotification(notification)} className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800">Edit</button>
                    <button type="button" onClick={() => deleteNotification(notification.id)} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">{notificationStatus}</p>
      </div>

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
                placeholder="Headline (optional)"
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
                <>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={sliderVideoSource}
                    onChange={(e) => setSliderVideoSource(e.target.value as "link" | "gallery")}
                  >
                    <option value="link">Video link</option>
                    <option value="gallery">Upload from gallery</option>
                  </select>
                  {sliderVideoSource === "gallery" ? (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        className="w-full rounded border px-3 py-2"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSliderFile(file);
                          setSliderPreviewUrl(file ? file.name : "");
                        }}
                      />
                      {sliderFile ? (
                        <p className="mt-2 text-sm text-slate-600">Selected video: {sliderFile.name}</p>
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
                </>
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

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Customer Quotes Manager</h2>
        <p className="mt-1 text-sm text-slate-600">Add client testimonials to the quotes section on the homepage.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border bg-slate-50 p-4 space-y-3">
            <textarea
              className="min-h-32 w-full rounded border px-3 py-2"
              placeholder="Customer quote"
              value={quoteText}
              onChange={(event) => setQuoteText(event.target.value)}
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Customer name"
              value={quoteAuthor}
              onChange={(event) => setQuoteAuthor(event.target.value)}
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Designation or company (optional)"
              value={quoteDesignation}
              onChange={(event) => setQuoteDesignation(event.target.value)}
            />
            <button onClick={handleCreateQuote} disabled={quoteLoading} className="rounded bg-brand-green px-4 py-2 font-semibold text-white">
              {quoteLoading ? "Saving..." : "Add quote"}
            </button>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="font-semibold">Published Quotes</h3>
            <div className="mt-4 space-y-3">
              {quotes.length === 0 ? <p className="text-sm text-slate-600">No customer quotes yet.</p> : null}
              {quotes.map((item) => (
                <div key={item.id} className="rounded-lg border bg-white p-3">
                  <p className="text-sm text-slate-700">“{item.quote}”</p>
                  <p className="mt-2 font-semibold">{item.author}</p>
                  {item.designation ? <p className="text-sm text-slate-500">{item.designation}</p> : null}
                  <button onClick={() => handleDeleteQuote(item.id)} className="mt-3 rounded bg-red-100 px-3 py-1 text-sm text-red-700">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">{quoteStatus}</p>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Reviews Manager</h2>
            <p className="mt-1 text-sm text-slate-600">Moderate customer reviews before they go live on the website.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setReviewFilter(option);
                  void (async () => {
                    const response = await fetch(`/api/reviews${option === "all" ? "" : `?status=${option}`}`);
                    const data = await response.json();
                    if (response.ok && data.success) setReviews(data.data || []);
                  })();
                }}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${reviewFilter === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? <p className="text-sm text-slate-600">No reviews found for this view.</p> : null}
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <h3 className="font-semibold text-slate-900">{review.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">Rating: {"★".repeat(review.rating)}{review.rating < 5 ? "☆".repeat(5 - review.rating) : ""}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{review.review}</p>
                  {review.photoUrl ? <img src={review.photoUrl} alt={review.name} className="mt-3 h-28 w-40 rounded object-cover" /> : null}
                </div>
                <div className="text-sm text-slate-600 sm:text-right">
                  <p className="font-medium text-slate-800">Status: {review.status}</p>
                  <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleString()}</time>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => handleReviewDecision(review.id, "approved")} className="rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white">Approve</button>
                <button type="button" onClick={() => handleReviewDecision(review.id, "rejected")} className="rounded bg-amber-600 px-3 py-1 text-sm font-semibold text-white">Reject</button>
                <button type="button" onClick={() => handleDeleteReview(review.id)} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700">Delete</button>
              </div>
            </article>
          ))}
        </div>
        {reviewStatusMessage ? <p className="mt-4 text-sm text-slate-600">{reviewStatusMessage}</p> : null}
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Enquiries</h2>
            <p className="mt-1 text-sm text-slate-600">Contact form submissions from website visitors.</p>
          </div>
          <button type="button" onClick={loadEnquiries} className="rounded bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">
            Refresh
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {enquiries.length === 0 ? <p className="text-sm text-slate-600">No enquiries received yet.</p> : null}
          {enquiries.map((enquiry) => (
            <article key={enquiry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <h3 className="font-semibold text-slate-900">{enquiry.name}</h3>
                  <a href={`mailto:${enquiry.email}`} className="mt-1 block text-sm text-brand-green hover:underline">{enquiry.email}</a>
                  <a href={`tel:${enquiry.phone.replace(/[^+\\d]/g, "")}`} className="block text-sm text-brand-green hover:underline">{enquiry.phone}</a>
                </div>
                <div className="text-sm text-slate-600 sm:text-right">
                  <p className="font-medium text-slate-800">{enquiry.service}</p>
                  <time dateTime={enquiry.createdAt}>{new Date(enquiry.createdAt).toLocaleString()}</time>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{enquiry.message}</p>
              <button type="button" onClick={() => handleDeleteEnquiry(enquiry.id)} className="mt-4 rounded bg-red-100 px-3 py-1 text-sm text-red-700">
                Delete
              </button>
            </article>
          ))}
        </div>
        {enquiryStatus ? <p className="mt-4 text-sm text-slate-600">{enquiryStatus}</p> : null}
      </div>
    </div>
  );
}

function AddItemForm({
  onAdd,
  loading,
  subtype,
}: {
  onAdd: (payload: {
    title: string;
    short: string;
    detailed?: string;
    mediaType: "image" | "video";
    mediaUrl: string;
    actionLink: string;
    imageFile?: File;
  }) => Promise<boolean>;
  loading: boolean;
  subtype: string;
}) {
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
    <div className="mt-6 rounded-2xl border p-4 bg-slate-50">
      <h3 className="font-semibold">Add new item — {subtype}</h3>
      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded border"
        />
        <input
          placeholder="Short description"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="px-3 py-2 rounded border"
        />
      </div>
      <textarea
        placeholder="Detailed description"
        value={detailed}
        onChange={(e) => setDetailed(e.target.value)}
        className="w-full mt-3 px-3 py-2 rounded border"
        rows={4}
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <select
          className="rounded border px-3 py-2"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as "image" | "video")}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <input
          placeholder="Action link"
          value={actionLink}
          onChange={(e) => setActionLink(e.target.value)}
          className="px-3 py-2 rounded border"
        />
      </div>
      {mediaType === "video" ? (
        <div className="mt-3">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Video URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="mt-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Image URL (optional if uploading file)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
        </>
      )}

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
