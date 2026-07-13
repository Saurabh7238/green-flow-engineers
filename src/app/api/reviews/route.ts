import { NextResponse } from "next/server";
import { createReview, deleteReview, listReviews, updateReviewStatus } from "@/lib/reviews";
import { isMongoDbConfigured } from "@/lib/mongodb";

export async function GET(request: Request) {
  if (!isMongoDbConfigured()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    return NextResponse.json({ success: true, data: await listReviews({ status: status as "pending" | "approved" | "rejected" | "all" }) });
  } catch (error) {
    console.error("Failed to list reviews:", error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const review = typeof body.review === "string" ? body.review.trim() : "";
    const rating = Number(body.rating);
    const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl.trim() : "";

    if (!name || !review) {
      return NextResponse.json({ error: "Name and review text are required" }, { status: 400 });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: await createReview({ name, rating, review, photoUrl }) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!id || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid review update payload" }, { status: 400 });
    }

    const updated = await updateReviewStatus(id, status as "pending" | "approved" | "rejected");
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update review status:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing review id" }, { status: 400 });
    }

    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
