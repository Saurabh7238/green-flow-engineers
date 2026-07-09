import { getDb } from "./mongodb";

export type AuthUser = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "admin" | "user";
  createdAt?: Date;
};

export async function createUser(user: AuthUser) {
  // Try DB first; if DB is unreachable, fall back to in-memory store.
  try {
    const db = await getDb();
    const users = db.collection<AuthUser>("users");

    const existingUser = await users.findOne({
      $or: [{ email: user.email }, { mobile: user.mobile }],
    });

    if (existingUser) {
      throw new Error("USER_EXISTS");
    }

    const result = await users.insertOne({
      ...user,
      createdAt: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      ...user,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("createUser error:", err);
    throw err;
  }
}

export async function findUserByCredentials(loginIdentifier: string, password: string) {
  try {
    const db = await getDb();
    const users = db.collection<AuthUser>("users");

    return users.findOne({
      $or: [{ email: loginIdentifier }, { mobile: loginIdentifier }],
      password,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("findUserByCredentials error:", err);
    throw err;
  }
}

export async function findOrCreateAdminUser() {
  try {
    const db = await getDb();
    const users = db.collection<AuthUser>("users");

    const existingAdmin = await users.findOne({ email: "admin@mail.com" });

    if (existingAdmin) {
      return existingAdmin;
    }

    const adminUser: AuthUser = {
      name: "admin",
      email: "admin@mail.com",
      mobile: "0000000000",
      password: "admin123",
      role: "admin",
    };

    const result = await users.insertOne({
      ...adminUser,
      createdAt: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      ...adminUser,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("findOrCreateAdminUser error:", err);
    throw err;
  }
}
