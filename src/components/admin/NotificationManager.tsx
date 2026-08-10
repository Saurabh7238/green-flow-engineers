"use client";

import React, { useEffect, useState } from "react";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  image?: string;
  file?: string;
  active: boolean;
  expiresAt?: string | null;
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

export function NotificationManager() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationImage, setNotificationImage] = useState("");
  const [notificationFile, setNotificationFile] = useState("");
  const [notificationImageFile, setNotificationImageFile] = useState<File | null>(null);
  const [notificationAttachment, setNotificationAttachment] = useState<File | null>(null);
  const [notificationActive, setNotificationActive] = useState(true);
  const [notificationExpiresAt, setNotificationExpiresAt] = useState("");
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");

  useEffect(() => {
    void loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (response.ok && data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error(error);
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

  const uploadNotificationFile = async (file: File) => {
    try {
      const pres = await fetch("/api/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const presData = await pres.json();
      if (!pres.ok || !presData?.url) {
        return { success: false, error: presData?.error || "Failed to get upload URL" };
      }

      const putRes = await fetch(presData.url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) {
        return { success: false, error: "Failed to upload file to storage" };
      }

      return { success: true, url: presData.publicUrl };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const resetForm = () => {
    setNotificationId(null);
    setNotificationTitle("");
    setNotificationMessage("");
    setNotificationImage("");
    setNotificationFile("");
    setNotificationImageFile(null);
    setNotificationAttachment(null);
    setNotificationActive(true);
    setNotificationExpiresAt("");
    setNotificationStatus("");
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
        body: JSON.stringify({
          id: notificationId || undefined,
          title: notificationTitle,
          message: notificationMessage,
          image,
          file,
          active: notificationActive,
          expiresAt: notificationExpiresAt ? new Date(`${notificationExpiresAt}T23:59:59.999`).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save notification.");

      resetForm();
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
      if (notificationId === id) resetForm();
      setNotificationStatus("Notification deleted.");
      await loadNotifications();
    } catch (error) {
      setNotificationStatus(error instanceof Error ? error.message : "Failed to delete notification.");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Popup Notification Manager</h2>
          <p className="mt-1 text-sm text-slate-600">Create and manage the popup shown to website visitors.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-medium text-slate-700">
            Notification title
            <input value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} placeholder="Notification title (optional)" className="mt-2 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700 mt-4">
            Notification message
            <textarea value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} placeholder="Notification message (optional)" className="mt-2 w-full rounded-lg border px-3 py-2" rows={4} />
          </label>
          <label className="block text-sm font-medium text-slate-700 mt-4">
            Image URL (optional)
            <input value={notificationImage} onChange={(event) => setNotificationImage(event.target.value)} placeholder="Image URL (optional)" className="mt-2 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700 mt-4">
            Upload image (optional)
            <input type="file" accept="image/*" onChange={(event) => setNotificationImageFile(event.target.files?.[0] || null)} className="mt-2 w-full rounded-lg border bg-white px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700 mt-4">
            Download file URL (optional)
            <input value={notificationFile} onChange={(event) => setNotificationFile(event.target.value)} placeholder="Download file URL (optional)" className="mt-2 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700 mt-4">
            Upload download file (optional)
            <input type="file" onChange={(event) => setNotificationAttachment(event.target.files?.[0] || null)} className="mt-2 w-full rounded-lg border bg-white px-3 py-2" />
          </label>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={notificationActive} onChange={(event) => setNotificationActive(event.target.checked)} />
            Active — show this popup to visitors
          </label>
          <label className="block text-sm font-medium text-slate-700 mt-4">
            Show until (optional)
            <input type="date" value={notificationExpiresAt} onChange={(event) => setNotificationExpiresAt(event.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2" />
            <span className="mt-1 block text-xs text-slate-500">The notification remains active through the end of this date.</span>
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={notificationLoading} onClick={saveNotification} className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {notificationLoading ? "Saving..." : notificationId ? "Update notification" : "Create notification"}
            </button>
            {notificationId ? (
              <button type="button" onClick={resetForm} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-semibold">Saved Notifications</h3>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? <p className="text-sm text-slate-600">No notifications created yet.</p> : null}
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">{notification.title || "Untitled notification"}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${notification.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {notification.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{notification.message || "No message provided."}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {notification.expiresAt ? `Expires: ${new Date(notification.expiresAt).toLocaleDateString()}` : "No expiry date"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => editNotification(notification)} className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-800">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteNotification(notification.id)} className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {notificationStatus ? <p className="mt-4 text-sm text-slate-600">{notificationStatus}</p> : null}
    </section>
  );
}
