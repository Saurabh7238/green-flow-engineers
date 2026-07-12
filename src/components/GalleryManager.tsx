"use client";

import { useEffect, useState } from "react";

type LocalizedText = { en: string; hi: string };
type Item = {
  id: string;
  type: "project" | "machinery";
  image: string;
  title: LocalizedText;
  description: LocalizedText;
  location?: LocalizedText;
  featured?: boolean;
};

const emptyText = (): LocalizedText => ({ en: "", hi: "" });

export function GalleryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState(emptyText);
  const [description, setDescription] = useState(emptyText);
  const [location, setLocation] = useState(emptyText);
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<Item["type"]>("project");
  const [featured, setFeatured] = useState(true);
  const [status, setStatus] = useState("");

  const load = async () => {
    const response = await fetch("/api/gallery");
    const data = await response.json();
    if (response.ok) setItems(data.data || []);
  };

  useEffect(() => { void load(); }, []);

  const setText = (setter: (value: LocalizedText) => void, value: LocalizedText, locale: keyof LocalizedText, next: string) => {
    setter({ ...value, [locale]: next });
  };

  const save = async () => {
    if (!file && !image.trim()) {
      setStatus("Add a gallery image.");
      return;
    }

    try {
      let imageUrl = image.trim();
      if (file) {
        const form = new FormData();
        form.append("image", file);
        const upload = await fetch("/api/upload-image", { method: "POST", body: form });
        const data = await upload.json();
        if (!upload.ok || !data.url) throw new Error(data.error || "Image upload failed.");
        imageUrl = data.url;
      }
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, image: imageUrl, type, featured }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save gallery item.");
      setTitle(emptyText());
      setDescription(emptyText());
      setLocation(emptyText());
      setImage("");
      setFile(null);
      setStatus("Gallery item published.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save gallery item.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this gallery item?")) return;
    const response = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) { await load(); setStatus("Gallery item deleted."); }
  };

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">Gallery Manager</h2>
      <p className="mt-1 text-sm text-slate-600">Add gallery projects and machinery without changing the existing gallery layout.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
          <input className="w-full rounded border px-3 py-2" placeholder="Title (English, optional)" value={title.en} onChange={(event) => setText(setTitle, title, "en", event.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Title (Hindi, optional)" value={title.hi} onChange={(event) => setText(setTitle, title, "hi", event.target.value)} />
          <textarea className="min-h-20 w-full rounded border px-3 py-2" placeholder="Description (English, optional)" value={description.en} onChange={(event) => setText(setDescription, description, "en", event.target.value)} />
          <textarea className="min-h-20 w-full rounded border px-3 py-2" placeholder="Description (Hindi, optional)" value={description.hi} onChange={(event) => setText(setDescription, description, "hi", event.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Location (English, optional)" value={location.en} onChange={(event) => setText(setLocation, location, "en", event.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Location (Hindi, optional)" value={location.hi} onChange={(event) => setText(setLocation, location, "hi", event.target.value)} />
          <select className="w-full rounded border px-3 py-2" value={type} onChange={(event) => setType(event.target.value as Item["type"])}><option value="project">Project</option><option value="machinery">Machinery</option></select>
          <input type="file" accept="image/*" className="w-full rounded border bg-white px-3 py-2" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Image URL (optional if uploading)" value={image} onChange={(event) => setImage(event.target.value)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Show on homepage</label>
          <button type="button" onClick={save} className="rounded bg-brand-green px-4 py-2 font-semibold text-white">Publish gallery item</button>
        </div>
        <div className="space-y-3 rounded-2xl border bg-slate-50 p-4">
          <h3 className="font-semibold">Admin-added gallery items</h3>
          {items.length === 0 ? <p className="text-sm text-slate-600">No gallery items added yet.</p> : null}
          {items.map((item) => <article key={item.id} className="rounded-lg border bg-white p-3"><img src={item.image} alt="" className="mb-2 h-24 w-full rounded object-cover" /><p className="font-semibold">{item.title.en}</p><p className="text-sm text-slate-600">{item.type}</p><button type="button" onClick={() => remove(item.id)} className="mt-2 rounded bg-red-100 px-3 py-1 text-sm text-red-700">Delete</button></article>)}
        </div>
      </div>
      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
    </section>
  );
}
