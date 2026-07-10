import { NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxSizeBytes = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > maxSizeBytes) {
      return NextResponse.json({ error: `Image must be smaller than ${Math.round(maxSizeBytes / (1024 * 1024))} MB` }, { status: 413 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: { contentType: file.type },
    });

    uploadStream.end(buffer);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    const fileId = uploadStream.id as ObjectId;
    const requestOrigin = request.headers.get("origin") || request.headers.get("x-forwarded-proto") || "http://localhost:3000";
    const baseUrl = requestOrigin.includes("http") ? requestOrigin : `https://${requestOrigin}`;
    const publicUrl = new URL(`/api/image/${fileId.toString()}`, baseUrl).toString();

    return NextResponse.json({ success: true, url: publicUrl, id: fileId.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const fileUrl = url.searchParams.get("url");
    const idParam = url.searchParams.get("id");
    const targetId = idParam || (fileUrl?.startsWith("/api/image/") ? fileUrl.slice("/api/image/".length) : undefined);

    if (!targetId || !ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "No valid image ID provided" }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    await bucket.delete(new ObjectId(targetId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
