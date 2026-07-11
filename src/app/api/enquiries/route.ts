import { NextResponse } from "next/server";
import { createEnquiry, deleteEnquiry, listEnquiries } from "@/lib/enquiries";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await listEnquiries() });
  } catch (error) {
    console.error("Failed to list enquiries:", error);
    return NextResponse.json({ error: "Failed to load enquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const service = typeof body.service === "string" ? body.service.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json({ error: "All enquiry fields are required" }, { status: 400 });
    }
    if (name.length > 120 || email.length > 160 || phone.length > 40 || service.length > 80 || message.length > 3000) {
      return NextResponse.json({ error: "One or more enquiry fields are too long" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: await createEnquiry({ name, email, phone, service, message }) }, { status: 201 });
  } catch (error) {
    console.error("Failed to save enquiry:", error);
    return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing enquiry id" }, { status: 400 });

    await deleteEnquiry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete enquiry:", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
