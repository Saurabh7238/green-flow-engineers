import "server-only";
import { MongoClient } from "mongodb";

const options = {};

export function isMongoDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required. Add it to your server environment variables.");
  }

  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(uri, options);
  // Create a connect promise that may attempt an optional insecure TLS fallback
  // if the initial connection fails and the environment allows it.
  // eslint-disable-next-line no-console
  globalThis.__mongoClientPromise = (async () => {
    try {
      return await client.connect();
    } catch (err) {
      console.error("MongoDB initial connect error:", err);

      const allowInsecure = String(process.env.MONGODB_ALLOW_INSECURE_TLS || "").toLowerCase() === "true";
      if (allowInsecure) {
        console.warn("MONGODB_ALLOW_INSECURE_TLS=true — attempting insecure TLS connection (dev only)");
        const insecureClient = new MongoClient(uri, { ...options, tlsAllowInvalidCertificates: true, tlsAllowInvalidHostnames: true });
        return insecureClient.connect();
      }

      throw err;
    }
  })();
  }

  return globalThis.__mongoClientPromise as Promise<MongoClient>;
}

export async function getMongoClient() {
  return getClientPromise();
}

export async function getDb() {
  // Database-backed pages must wait for a request. Otherwise Next.js tries to
  // authenticate with MongoDB while prerendering pages during `next build`.
  // Import `connection` dynamically so files that import this module but are
  // statically prerendered (SSG) don't trigger dynamic server usage at build time.
  const { connection } = await import("next/server");
  await connection();
  const client = await getMongoClient();
  return client.db("greenflow");
}

export async function testDbConnection() {
  try {
    const client = await getMongoClient();
    await client.db("greenflow").command({ ping: 1 });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DB ping failed:", err);
    return false;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}
