import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const content = await db.collection("site_content").findOne({ key: "siteContent" });

    return NextResponse.json(content ?? { message: "No content found" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load site content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();

    await db.collection("site_content").updateOne(
      { key: "siteContent" },
      { $set: { ...body, updatedAt: new Date() } },
      { upsert: true },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save site content" }, { status: 500 });
  }
}
