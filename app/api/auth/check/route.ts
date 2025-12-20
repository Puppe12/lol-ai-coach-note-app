import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json({ userId });
  } catch (err: any) {
    return NextResponse.json({ userId: null });
  }
}



