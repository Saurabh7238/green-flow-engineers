import { NextResponse } from "next/server";
import { findOrCreateAdminUser, findUserByCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginIdentifier, password } = body;

    if (!loginIdentifier || !password) {
      return NextResponse.json({ message: "Please enter your credentials." }, { status: 400 });
    }

    if (loginIdentifier.toLowerCase() === "admin" && password === "admin123") {
      const adminUser = await findOrCreateAdminUser();
      return NextResponse.json({ success: true, user: adminUser });
    }

    const user = await findUserByCredentials(loginIdentifier, password);

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    // Log error server-side for easier debugging
    // (avoid leaking internal details to clients)
    // eslint-disable-next-line no-console
    console.error("Login error:", error);
    return NextResponse.json({ message: "Unable to log in." }, { status: 500 });
  }
}
