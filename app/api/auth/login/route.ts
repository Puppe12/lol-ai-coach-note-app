import { NextResponse } from "next/server";
import { setUserId } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 }
      );
    }

    const trimmedUserId = userId.trim();

    if (trimmedUserId.length === 0) {
      return NextResponse.json(
        { error: "UserId cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedUserId.length > 100) {
      return NextResponse.json(
        { error: "UserId must be 100 characters or less" },
        { status: 400 }
      );
    }

    await setUserId(trimmedUserId);

    return NextResponse.json({ ok: true, userId: trimmedUserId });
  } catch (err: any) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 500 }
    );
  }
}



