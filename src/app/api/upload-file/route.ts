import { NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Uploads downloadable notification attachments to the existing GridFS bucket. */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be smaller than 10 MB" }, { status: 413 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const uploadStream = bucket.openUploadStream(file.name, { metadata: { contentType: file.type } });
    uploadStream.end(Buffer.from(await file.arrayBuffer()));
    await new Promise<void>((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    const fileId = uploadStream.id as ObjectId;
    return NextResponse.json({ success: true, url: `/api/image/${fileId.toString()}` });
  } catch (error) {
    console.error("Failed to upload file", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
