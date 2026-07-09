import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new (await import("mongodb")).GridFSBucket(db, { bucketName: "uploads" });

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));
    const chunks: Uint8Array[] = [];

    await new Promise<void>((resolve, reject) => {
      downloadStream.on("data", (chunk) => chunks.push(chunk));
      downloadStream.on("end", resolve);
      downloadStream.on("error", reject);
    });

    const file = await db.collection("uploads.files").findOne({ _id: new ObjectId(id) });
    if (!file) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(Buffer.concat(chunks), {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
