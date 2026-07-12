import { NextResponse } from "next/server";
import { addSlide, listSlider, updateSlide, deleteSlide } from "@/lib/slider";
import { isMongoDbConfigured } from "@/lib/mongodb";

export async function GET(request: Request) {
  if (!isMongoDbConfigured()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const url = new URL(request.url);
    const sliderName = url.searchParams.get("slider") || "HOMEPAGE_HERO_SLIDER";
    const list = await listSlider(sliderName);
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list slider" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sliderName = body.slider || "HOMEPAGE_HERO_SLIDER";
    const item = await addSlide(sliderName, body);
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add slide" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const sliderName = body.slider || "HOMEPAGE_HERO_SLIDER";
    const id = body.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const updated = await updateSlide(sliderName, id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update slide" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const sliderName = url.searchParams.get("slider") || "HOMEPAGE_HERO_SLIDER";
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteSlide(sliderName, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 });
  }
}
