import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserId } from "@/lib/session";
import { UserGoalsSchema } from "@/app/lib/schemas/goals";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = UserGoalsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { mainGoal, secondaryGoals } = parsed.data;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "lolcoach");

    const now = new Date();

    await db.collection("goals").updateOne(
      { userId },
      {
        $set: {
          userId,

          mainGoal: {
            ...mainGoal,
            createdAt: now,
            updatedAt: now,
          },

          secondaryGoals: secondaryGoals.map((g) => ({
            ...g,
            source: "recommended",
            createdAt: now,
            updatedAt: now,
          })),

          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to save user goals:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
