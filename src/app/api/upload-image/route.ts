import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxSizeBytes = 3 * 1024 * 1024;

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

    const fileSize = file.size || (await file.arrayBuffer()).byteLength;
    if (fileSize > maxSizeBytes) {
      return NextResponse.json({ error: "Image must be smaller than 3 MB" }, { status: 400 });
    }

    const extension = path.extname(file.name) || ".jpg";
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "service-images");
    const filePath = path.join(uploadDir, fileName);

    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/service-images/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const fileUrl = url.searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const uploadsPrefix = "/uploads/service-images/";
    if (!fileUrl.startsWith(uploadsPrefix)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const fileName = decodeURIComponent(fileUrl.slice(uploadsPrefix.length));
    if (!fileName || fileName.includes("..") || fileName.includes("/")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", "service-images", fileName);

    // If the file does not exist, treat delete as successful (idempotent)
    const exists = await fs
      .stat(filePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      console.warn(`upload-image: file not found for deletion: ${filePath}`);
      return NextResponse.json({ success: true });
    }

    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
