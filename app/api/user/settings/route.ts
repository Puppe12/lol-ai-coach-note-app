import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";

export type UserSettings = {
  summonerName: string;
};

export const UserSettingsSchema = z.object({
  summonerName: z.string(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "lolcoach");

  const user = await db
    .collection("users")
    .findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { settings: 1 } }
    );
  return NextResponse.json(user?.settings ?? { summonerName: "" });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsedBody = UserSettingsSchema.parse(body);
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "lolcoach");

  /* Dynamically parse through any possibly sent options so we can re-use this same PATCH for singular-values */
  const updates = Object.fromEntries(
    Object.entries(parsedBody).map(([key, value]) => [`settings.${key}`, value])
  );

  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(session.user.id) }, { $set: updates });

  return NextResponse.json({ success: true });
}
