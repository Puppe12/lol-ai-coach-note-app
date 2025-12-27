import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserId } from "@/lib/session";
import OpenAI from "openai";
import { GoalsSchema } from "@/app/lib/schemas/goals";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const deployment = process.env.AZURE_OPENAI_GPT4O_MINI!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const ai = new OpenAI({
  apiKey,
  baseURL: `${endpoint}/openai/deployments/${deployment}`,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY! },
});

export const POST = async (req: Request) => {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "lolcoach");

    // Get recent notes from this user
    const notes = await db
      .collection("notes")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    if (notes.length === 0) {
      return NextResponse.json({
        goals: [],
        message: "No notes found for this user",
      });
    }

    // Combine text content
    const combinedText = notes
      .map(
        (n, i) =>
          `NOTE ${i + 1}:\nText: ${n.text}\nTags: ${n.ai?.tags?.join(", ") ?? "none"}`
      )
      .join("\n\n");
    /* TODO: add examples to the AI prompt? */
    const systemPrompt = `
You are a CHALLENGER-LEVEL League of Legends coach.

Your job:
- analyze the player's recent notes
- identify real performance patterns
- generate elite-level training goals
- the user may be a high-elo player (Master/GM/Challenger)
- avoid generic advice ("farm more", "ward more", "play safe")
- advice MUST be matchup-, timing-, or mechanic-specific
- include reasoning, but do NOT hallucinate incorrect note content
- suggestions should support the generated goals, and the user should be able to use the suggestions to achieve the goals.
- VERY IMPORTANT: Base findings on the user’s actual notes and tags.

Your output MUST be strict JSON:

{
  "improvementAreas": [],
  "recommendedGoals": [],
  "suggestions": [],
  "longTermGoals": [],
  "skillPlan": {
    "laning": [],
    "midgame": [],
    "macro": [],
    "mechanics": []
  }
}
`;

    const userPrompt = `
Here are the player's combined notes:

${combinedText}

Generate a goal plan based ONLY on their real issues, but you may add expert reasoning from your experience as a challenger coach.
`;
    const model = process.env.AZURE_OPENAI_GPT4O_MINI!;
    console.log("model", model);
    const result = await ai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    // OpenAI SDK types message.content as string | null; guard before parsing.
    const content = result.choices[0].message.content ?? "{}";
    const json = JSON.parse(content);

    const validated = GoalsSchema.parse(json);

    return NextResponse.json(validated);
  } catch (err: any) {
    console.error("Goal generation failed:", err);
    return NextResponse.json(
      { error: err.message || "unknown" },
      { status: 500 }
    );
  }
};

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "lolcoach");

    // Fetch latest goals document
    const goalsDoc = await db
      .collection("goals")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (!goalsDoc) {
      return NextResponse.json({ goals: null });
    }

    return NextResponse.json({ goals: goalsDoc });
  } catch (err: any) {
    console.error("Failed to fetch goals:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
