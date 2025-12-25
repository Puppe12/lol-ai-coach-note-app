import { NextResponse } from "next/server";
import OpenAI from "openai";

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
   - champion
   - likely role if visible or inferable
   - direct lane opponent if visible
5. IMPORTANT: Detect the game outcome (Victory or Defeat):
   - Look for "Victory" or "Defeat" banners/text in the image
   - Check team colors and UI indicators
   - If unclear or not visible, return "unknown"

If something is unclear, use "unknown". Do NOT guess.

Output STRICT JSON in this exact shape:
{
  "me": {
    "summoner": "",
    "champion": "",
    "role": "",
    "opponentChampion": ""
  },
  "teams": {
    "allies": [],
    "enemies": []
  },
  "gameOutcome": "victory" | "defeat" | "unknown"
}
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
      throw new Error("Analyziz failed, make sure selected image includes clear endgame lobby screenshot");
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
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
