import { NextResponse } from "next/server";
import { serviceKeys, type ServiceKey } from "@/data/services";
import {
  getServiceContent,
  upsertServiceContent,
  deleteServiceContent,
  deleteServiceContentItem,
  sanitizeServiceContentItem,
} from "@/lib/service-content";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const serviceKey = url.searchParams.get("serviceKey");
    const locale = url.searchParams.get("locale") || "en";
    const variant = url.searchParams.get("variant") || undefined;

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    const content = await getServiceContent(serviceKey as ServiceKey, locale, variant);
    return NextResponse.json({ success: true, data: content ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load service content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceKey, locale, variant, title, description, imageUrl, items, sections } = body;

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    const normalizedItems = Array.isArray(items) ? items.map((item: any) => sanitizeServiceContentItem(item, serviceKey as ServiceKey, "")) : [];

    await upsertServiceContent({
      serviceKey: serviceKey as ServiceKey,
      locale: locale || "en",
      variant: variant || undefined,
      title: title || "",
      description: description || "",
      imageUrl: imageUrl || "",
      items: normalizedItems,
      sections: Array.isArray(sections) ? sections : [],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save service content" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { serviceKey, locale, variant, itemId, updates } = body;

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    if (!itemId || typeof updates !== "object") {
      return NextResponse.json({ error: "Missing itemId or update payload" }, { status: 400 });
    }

    const existing = await getServiceContent(serviceKey as ServiceKey, locale || "en", variant || undefined);
    if (!existing?.items) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const itemIndex = existing.items.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    existing.items[itemIndex] = {
      ...existing.items[itemIndex],
      ...sanitizeServiceContentItem({ ...existing.items[itemIndex], ...updates }, serviceKey as ServiceKey, existing.items[itemIndex].subtype),
    };

    await upsertServiceContent(existing);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update service content item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const serviceKey = url.searchParams.get("serviceKey");
    const locale = url.searchParams.get("locale") || "en";
    const variant = url.searchParams.get("variant") || undefined;
    const itemId = url.searchParams.get("itemId") || undefined;

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    if (itemId) {
      await deleteServiceContentItem(serviceKey as ServiceKey, locale, variant, itemId);
      return NextResponse.json({ success: true });
    }

    await deleteServiceContent(serviceKey as ServiceKey, locale, variant);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete service content" }, { status: 500 });
  }
}
