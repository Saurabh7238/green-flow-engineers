import { getDb } from "./mongodb";

/**
 * The document shape saved by the notification section of the admin panel.
 * `image` and `file` are public URLs returned by the upload flow.
 */
export type Notification = {
  id?: string;
  title: string;
  message: string;
  image?: string;
  file?: string;
  active: boolean;
  /** Optional inclusive expiry timestamp set from the admin's “show until” date. */
  expiresAt?: Date | null;
  updatedAt?: Date;
};

/** Returns the most recently updated notification that is currently active. */
export async function getActiveNotification(): Promise<Notification | null> {
  const db = await getDb();
  const notification = await db
    .collection<Notification>("notifications")
    .find({
      active: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } },
      ],
    })
    .sort({ updatedAt: -1 })
    .limit(1)
    .next();

  return notification;
}
