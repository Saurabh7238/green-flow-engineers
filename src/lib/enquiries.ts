import { getDb } from "./mongodb";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: Date;
};

const ENQUIRIES_COLLECTION = "enquiries";

export async function createEnquiry(input: Omit<Enquiry, "id" | "createdAt">) {
  const enquiry: Enquiry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ...input,
    createdAt: new Date(),
  };

  await (await getDb()).collection<Enquiry>(ENQUIRIES_COLLECTION).insertOne(enquiry);
  return enquiry;
}

export async function listEnquiries() {
  return (await getDb()).collection<Enquiry>(ENQUIRIES_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
}

export async function deleteEnquiry(id: string) {
  await (await getDb()).collection<Enquiry>(ENQUIRIES_COLLECTION).deleteOne({ id });
}
