import { NextResponse } from "next/server";
import { createQuote, deleteQuote, listQuotes } from "@/lib/quotes";
import { isMongoDbConfigured } from "@/lib/mongodb";

export async function GET() {
  if (!isMongoDbConfigured()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    return NextResponse.json({ success: true, data: await listQuotes() });
  } catch (error) {
    console.error("Failed to list customer quotes:", error);
    return NextResponse.json({ error: "Failed to load customer quotes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = typeof body.quote === "string" ? body.quote.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const designation = typeof body.designation === "string" ? body.designation.trim() : "";

    if (!quote || !author) {
      return NextResponse.json({ error: "Quote and customer name are required" }, { status: 400 });
    }

    if (quote.length > 800 || author.length > 120 || designation.length > 160) {
      return NextResponse.json({ error: "Quote details are too long" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: await createQuote({ quote, author, designation }) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer quote:", error);
    return NextResponse.json({ error: "Failed to save customer quote" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing quote id" }, { status: 400 });
    }

    await deleteQuote(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete customer quote:", error);
    return NextResponse.json({ error: "Failed to delete customer quote" }, { status: 500 });
  }
}
