import { NextResponse } from "next/server";
import { clearUserId } from "@/lib/session";

export async function POST() {
  try {
    await clearUserId();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Logout failed:", err);
    return NextResponse.json(
      { error: err.message || "Logout failed" },
      { status: 500 }
    );
  }
}



