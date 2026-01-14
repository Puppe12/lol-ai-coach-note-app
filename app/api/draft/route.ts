import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AIDraftAnalysisSchema } from "@/app/lib/schemas/ai-prompts";
import { ZodError } from "zod";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_VISION}`,
  defaultQuery: {
    "api-version": "2024-02-15-preview",
  },
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_API_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const summonerName = formData.get("summonerName") as string | null;

    if (!image || !summonerName) {
      return NextResponse.json(
        { error: "Image and summonerName are required" },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = `
You are analyzing a League of Legends end-of-game or lobby screenshot.

The user's summoner name is: "${summonerName}".

Tasks:
1. Identify all players shown in the image.
2. Extract for each player:
   - summoner name
   - champion played
   - team (ally or enemy)
3. Identify which player matches the given summoner name.
4. For that player:
   - champion (REQUIRED: must be a string, not empty)
   - likely role if visible or inferable (REQUIRED: must be a string like "top", "jungle", "mid", "bot", "support")
   - direct lane opponent if visible (REQUIRED: must be a string, use "unknown" if not visible)
5. IMPORTANT: Detect the game outcome (Victory or Defeat):
   - Look for "Victory" or "Defeat" banners/text in the image
   - Check team colors and UI indicators
   - If unclear or not visible, return "unknown"

VALIDATION RULES:
- ALL fields in "me" object are REQUIRED and must be non-empty strings
- If you cannot determine a value, use "unknown" - NEVER use null or undefined
- "allies" and "enemies" must be arrays of player objects with summoner, champion, and team fields
- Each player object MUST have all three fields: summoner (string), champion (string), team ("ally" or "enemy")
- "gameOutcome" must be EXACTLY one of: "victory", "defeat", or "unknown" (lowercase only)

Output STRICT JSON in this EXACT format:

{
  "me": {
    "summoner": "string (the user's summoner name from input)",
    "champion": "string (champion name, never empty)",
    "role": "string (top/jungle/mid/bot/support or unknown)",
    "opponentChampion": "string (enemy laner champion or unknown)"
  },
  "teams": {
    "allies": [
      {
        "summoner": "string (player summoner name)",
        "champion": "string (champion name)",
        "team": "ally"
      }
    ],
    "enemies": [
      {
        "summoner": "string (player summoner name)",
        "champion": "string (champion name)",
        "team": "enemy"
      }
    ]
  },
  "gameOutcome": "victory OR defeat OR unknown"
}

CRITICAL: 
- Every field must have a string value. Never return null, undefined, or empty strings.
- Include ALL 5 players for allies (including the user) and ALL 5 players for enemies.
- The "team" field must be exactly "ally" or "enemy" (lowercase).
`;

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_VISION!,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Analysis failed, make sure selected image includes clear endgame lobby screenshot");
    }

    const parsed = JSON.parse(content);
    
    // Validate AI response with schema
    const validatedDraft = AIDraftAnalysisSchema.parse(parsed);

    return NextResponse.json(validatedDraft);
  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { 
          error: "Invalid AI response format", 
          details: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", "),
          issues: error.issues 
        },
        { status: 500 }
      );
    }
    
    console.error("Draft generation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
