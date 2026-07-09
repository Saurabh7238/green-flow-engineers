import { NextResponse } from "next/server";
import { serviceKeys, type ServiceKey } from "@/data/services";
import { getServiceContent, upsertServiceContent, deleteServiceContent } from "@/lib/service-content";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const serviceKey = url.searchParams.get("serviceKey");
    const locale = url.searchParams.get("locale") || "en";

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    const content = await getServiceContent(serviceKey as ServiceKey, locale);
    return NextResponse.json({ success: true, data: content ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load service content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceKey, locale, title, description, imageUrl, sections } = body;

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    await upsertServiceContent({
      serviceKey: serviceKey as ServiceKey,
      locale: locale || "en",
      title: title || "",
      description: description || "",
      imageUrl: imageUrl || "",
      sections: Array.isArray(sections) ? sections : [],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save service content" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const serviceKey = url.searchParams.get("serviceKey");
    const locale = url.searchParams.get("locale") || "en";

    if (!serviceKey || !serviceKeys.includes(serviceKey as ServiceKey)) {
      return NextResponse.json({ error: "Invalid serviceKey" }, { status: 400 });
    }

    await deleteServiceContent(serviceKey as ServiceKey, locale);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete service content" }, { status: 500 });
  }
}
