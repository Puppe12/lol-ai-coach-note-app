import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_GPT4O_MINI}`,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_API_KEY!,
  },
});

type AutotagRequest = {
  text: string;
  draft?: any; // optional structured draft from vision
};

export async function POST(req: Request) {
  try {
    const body: AutotagRequest = await req.json();

    if (!body?.text || typeof body.text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Build a concise prompt asking for tags only (structured JSON)
    const prompt = `You are an assistant that extracts concise, consistent tags from a player's game note
and optional draft info. Tags should be short, lowercase, single phrases (no spaces if possible, use hyphens).
Return JSON ONLY in the format:
{ "tags": ["tag1","tag2",...], "explanations": { "tag1": "brief reason", ... } }

Note text:
${body.text}

Draft (optional):
${body.draft ? JSON.stringify(body.draft) : "none"}

Focus on gameplay aspects (e.g. laning, cs, trading, wave-control, vision, jungle-tracking, roaming, tilt, mechanics, positioning, matchup-xxx),
and champion/role-specific tags like "ahri-mid" or "zed-vs-yasuo" when clearly present.
If nothing relevant, return an empty tags array: { "tags": [], "explanations": {} }.
Limit tags to 10 maximum.`;

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_GPT4O_MINI!,
      messages: [
        {
          role: "system",
          content: "You output strict JSON; do not include extra commentary.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.0,
      max_tokens: 400,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    // Try to parse JSON out of the response (remove any surrounding text)
    let parsed;
    try {
      // First try direct parse
      parsed = JSON.parse(content);
    } catch (e) {
      // Fallback: attempt to extract the first JSON block
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e2) {
          return NextResponse.json(
            { error: "Failed to parse model JSON response", raw: content },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Model returned non-JSON response", raw: content },
          { status: 500 }
        );
      }
    }

    // Ensure shape
    const tags = Array.isArray(parsed.tags) ? parsed.tags.map(String) : [];
    const explanations = parsed.explanations ?? {};

    return NextResponse.json({ tags, explanations });
  } catch (err: any) {
    console.error("POST /api/autotag error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
