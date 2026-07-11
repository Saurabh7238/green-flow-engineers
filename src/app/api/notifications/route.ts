import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { Notification } from "@/lib/notification";

const COLLECTION = "notifications";

function notificationId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeNotification(input: Partial<Notification>) {
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  return {
    title: input.title?.trim() || "",
    message: input.message?.trim() || "",
    image: input.image?.trim() || "",
    file: input.file?.trim() || "",
    active: input.active === true,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const notifications = await db.collection<Notification>(COLLECTION).find().sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Failed to list notifications", error);
    return NextResponse.json({ error: "Failed to list notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const values = sanitizeNotification(await request.json());
    if (!values.title || !values.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<Notification>(COLLECTION);
    if (values.active) await collection.updateMany({}, { $set: { active: false } });

    const notification: Notification = { id: notificationId(), ...values, updatedAt: new Date() };
    await collection.insertOne(notification);
    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error("Failed to create notification", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<Notification>;
    if (!body.id) return NextResponse.json({ error: "Notification id is required" }, { status: 400 });

    const values = sanitizeNotification(body);
    if (!values.title || !values.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<Notification>(COLLECTION);
    if (values.active) await collection.updateMany({ id: { $ne: body.id } }, { $set: { active: false } });
    await collection.updateOne({ id: body.id }, { $set: { ...values, updatedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notification", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Notification id is required" }, { status: 400 });

    const db = await getDb();
    await db.collection<Notification>(COLLECTION).deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
