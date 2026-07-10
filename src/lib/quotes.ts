import { getDb } from "./mongodb";

export type CustomerQuote = {
  id: string;
  quote: string;
  author: string;
  designation?: string;
  createdAt?: Date;
};

const QUOTES_COLLECTION = "customer_quotes";

export async function listQuotes() {
  const db = await getDb();
  return db.collection<CustomerQuote>(QUOTES_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
}

export async function createQuote(input: Omit<CustomerQuote, "id" | "createdAt">) {
  const quote: CustomerQuote = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    quote: input.quote,
    author: input.author,
    designation: input.designation || "",
    createdAt: new Date(),
  };

  const db = await getDb();
  await db.collection<CustomerQuote>(QUOTES_COLLECTION).insertOne(quote);
  return quote;
}

export async function deleteQuote(id: string) {
  const db = await getDb();
  await db.collection<CustomerQuote>(QUOTES_COLLECTION).deleteOne({ id });
}
