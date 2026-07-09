import { NextResponse } from "next/server";
import { testDbConnection } from "@/lib/mongodb";

export async function GET() {
  try {
    const ok = await testDbConnection();
    if (ok) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: "DB ping failed" }, { status: 503 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Health check error:", err);
    return NextResponse.json({ ok: false, message: "Health check failed" }, { status: 500 });
  }
}
