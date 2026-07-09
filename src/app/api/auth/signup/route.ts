import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, password, confirmPassword } = body;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return NextResponse.json({ message: "Please fill in all fields." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
    }

    const user = await createUser({
      name,
      email,
      mobile,
      password,
      role: "user",
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    // Log error server-side for debugging
    // eslint-disable-next-line no-console
    console.error("Signup error:", error);

    if (error instanceof Error && error.message === "USER_EXISTS") {
      return NextResponse.json({ message: "An account already exists for that email or mobile." }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to create account." }, { status: 500 });
  }
}
