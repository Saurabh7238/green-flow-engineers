import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth";

const SIGNUP_LIMIT = 5;
const SIGNUP_WINDOW_MS = 15 * 60 * 1000;
const signupAttempts = new Map<string, number[]>();

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

function checkSignupRateLimit(ip: string) {
  const now = Date.now();
  const windowStart = now - SIGNUP_WINDOW_MS;
  const recentAttempts = (signupAttempts.get(ip) ?? []).filter((attempt) => attempt > windowStart);

  if (recentAttempts.length >= SIGNUP_LIMIT) {
    signupAttempts.set(ip, recentAttempts);
    return { allowed: false, retryAfter: Math.ceil((recentAttempts[0] + SIGNUP_WINDOW_MS - now) / 1000) };
  }

  recentAttempts.push(now);
  signupAttempts.set(ip, recentAttempts);
  return { allowed: true, remaining: SIGNUP_LIMIT - recentAttempts.length };
}

export async function POST(request: Request) {
  const rateLimit = checkSignupRateLimit(getClientIp(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many signup attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
          "X-RateLimit-Limit": String(SIGNUP_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

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

    return NextResponse.json(
      { success: true, user },
      {
        headers: {
          "X-RateLimit-Limit": String(SIGNUP_LIMIT),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
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
