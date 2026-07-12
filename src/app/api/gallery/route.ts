import { NextResponse } from "next/server";
import { createGalleryItem, deleteGalleryItem, listGalleryItems } from "@/lib/gallery-content";

function localizedText(value: unknown) {
  if (!value || typeof value !== "object") return { en: "", hi: "" };
  const text = value as { en?: unknown; hi?: unknown };
  const en = typeof text.en === "string" ? text.en.trim() : "";
  const hi = typeof text.hi === "string" ? text.hi.trim() : "";
  return { en, hi };
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await listGalleryItems() });
  } catch (error) {
    console.error("Failed to load gallery items:", error);
    return NextResponse.json({ error: "Failed to load gallery items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = localizedText(body.title);
    const image = typeof body.image === "string" ? body.image.trim() : "";
    const description = localizedText(body.description);
    const location = localizedText(body.location);
    const type = body.type === "machinery" ? "machinery" : "project";

    if (!image) {
      return NextResponse.json({ error: "A gallery image is required" }, { status: 400 });
    }

    const item = await createGalleryItem({ title, image, description, location, type, featured: Boolean(body.featured) });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery item:", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing gallery item id" }, { status: 400 });

  try {
    await deleteGalleryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
