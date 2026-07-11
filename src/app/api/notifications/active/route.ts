import { NextResponse } from "next/server";
import { getActiveNotification } from "@/lib/notification";

/** Public endpoint consumed by the global notification popup. */
export async function GET() {
  try {
    const notification = await getActiveNotification();

    return NextResponse.json(
      { notification },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to load active notification", error);
    return NextResponse.json({ notification: null }, { status: 500 });
  }
}
