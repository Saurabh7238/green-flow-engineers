import { getDb } from "./mongodb";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type CustomerReview = {
  id: string;
  name: string;
  rating: number;
  review: string;
  photoUrl?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt?: Date;
};

const REVIEWS_COLLECTION = "customer_reviews";

type ReviewStore = {
  reviews: CustomerReview[];
};

const fallbackStore = globalThis as typeof globalThis & {
  __reviewFallbackStore?: ReviewStore;
};

function ensureFallbackStore() {
  if (!fallbackStore.__reviewFallbackStore) {
    fallbackStore.__reviewFallbackStore = { reviews: [] };
  }

  return fallbackStore.__reviewFallbackStore;
}

export async function listReviews(options?: { status?: ReviewStatus | "all" }) {
  try {
    const db = await getDb();
    const query = options?.status && options.status !== "all" ? { status: options.status } : {};
    return db.collection<CustomerReview>(REVIEWS_COLLECTION).find(query).sort({ createdAt: -1 }).toArray();
  } catch (error) {
    console.error("listReviews error:", error);
    const store = ensureFallbackStore();
    const items = store.reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!options?.status || options.status === "all") return items;
    return items.filter((review) => review.status === options.status);
  }
}

export async function createReview(input: Omit<CustomerReview, "id" | "createdAt" | "updatedAt" | "status"> & { status?: ReviewStatus }) {
  const review: CustomerReview = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    rating: Math.min(5, Math.max(1, input.rating)),
    review: input.review.trim(),
    photoUrl: input.photoUrl?.trim() || "",
    status: input.status || "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const db = await getDb();
    await db.collection<CustomerReview>(REVIEWS_COLLECTION).insertOne(review);
    return review;
  } catch (error) {
    console.error("createReview error:", error);
    const store = ensureFallbackStore();
    store.reviews.unshift(review);
    return review;
  }
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
  try {
    const db = await getDb();
    const result = await db.collection<CustomerReview>(REVIEWS_COLLECTION).findOneAndUpdate(
      { id },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    return result;
  } catch (error) {
    console.error("updateReviewStatus error:", error);
    const store = ensureFallbackStore();
    const review = store.reviews.find((item) => item.id === id);
    if (!review) return null;
    review.status = status;
    review.updatedAt = new Date();
    return review;
  }
}

export async function deleteReview(id: string) {
  try {
    const db = await getDb();
    await db.collection<CustomerReview>(REVIEWS_COLLECTION).deleteOne({ id });
    return true;
  } catch (error) {
    console.error("deleteReview error:", error);
    const store = ensureFallbackStore();
    store.reviews = store.reviews.filter((item) => item.id !== id);
    return true;
  }
}
