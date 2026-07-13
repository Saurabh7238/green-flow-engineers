import { NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, filename } = body;
    if (!sessionId || !filename) return NextResponse.json({ error: "Missing sessionId or filename" }, { status: 400 });

    const db = await getDb();
    const chunks = await db.collection("upload_chunks").find({ sessionId }).sort({ index: 1 }).toArray();
    if (!chunks || chunks.length === 0) return NextResponse.json({ error: "No chunks found" }, { status: 400 });

    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const uploadStream = bucket.openUploadStream(String(filename), { metadata: { contentType: chunks[0].contentType || "application/octet-stream" } });

    for (const c of chunks) {
      // c.data is stored as a Binary/Buffer
      const buf = c.data?.buffer ? Buffer.from(c.data.buffer) : Buffer.from(c.data);
      uploadStream.write(buf);
    }

    uploadStream.end();

    await new Promise<void>((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    const fileId = uploadStream.id as ObjectId;
    // cleanup chunks
    await db.collection("upload_chunks").deleteMany({ sessionId });

    return NextResponse.json({ success: true, url: `/api/image/${fileId.toString()}` });
  } catch (err) {
    console.error("Failed to assemble chunks", err);
    return NextResponse.json({ error: "Failed to assemble chunks" }, { status: 500 });
  }
}
