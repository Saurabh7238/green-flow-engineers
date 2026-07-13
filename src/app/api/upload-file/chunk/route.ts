import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const chunk = form.get("chunk");
    const sessionId = form.get("sessionId");
    const index = form.get("index");
    const filename = form.get("filename");
    const contentType = form.get("contentType");

    if (!sessionId || !index || !(chunk instanceof File) || !filename) {
      return NextResponse.json({ error: "Missing chunk parameters" }, { status: 400 });
    }

    const db = await getDb();
    const data = Buffer.from(await chunk.arrayBuffer());
    await db.collection("upload_chunks").insertOne({ sessionId: String(sessionId), index: Number(index), filename: String(filename), contentType: String(contentType || chunk.type || "application/octet-stream"), data, createdAt: new Date() });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to accept chunk", err);
    return NextResponse.json({ error: "Failed to accept chunk" }, { status: 500 });
  }
}
