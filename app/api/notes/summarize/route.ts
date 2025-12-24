import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserId } from "@/lib/session";
import OpenAI from "openai";

const GPTMiniModel = process.env.AZURE_OPENAI_GPT4O_MINI!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const openaiendpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const mongoDB = process.env.MONGODB_DB!;

const ai = new OpenAI({
  apiKey,
  baseURL: `${openaiendpoint}/openai/deployments/${GPTMiniModel}`,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: { "api-key": apiKey },
});

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { noteIds } = await req.json();

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return NextResponse.json(
        { error: "Note IDs array is required" },
        { status: 400 }
      );
    }

    // Fetch notes from MongoDB
    const client = await clientPromise;
    const db = client.db(mongoDB || "lolcoach");

    const notes = await db
      .collection("notes")
      .find({
        _id: { $in: noteIds.map((id) => id) },
        userId,
      })
      .toArray();

    if (notes.length === 0) {
      return NextResponse.json(
        { error: "No notes found" },
        { status: 404 }
      );
    }

    // Prepare notes content for summarization
    const notesContent = notes
      .map((note: any, index) => {
        const structured = note.structured;
        const positive = structured?.positive || "";
        const improvements = structured?.improvements || "";
        const matchup = structured?.matchup || note.draft?.me?.champion || "";

        return `Note ${index + 1}${matchup ? ` (${matchup})` : ""}:
Positives: ${positive || "N/A"}
Improvements: ${improvements || "N/A"}
---`;
      })
      .join("\n\n");

    // Generate summary using AI
    const prompt = `You are analyzing multiple League of Legends game notes. Provide a comprehensive summary that identifies patterns and key insights.

Notes to analyze:
${notesContent}

Please provide:
1. Common Positive Patterns: What gameplay aspects are consistently done well?
2. Common Areas for Improvement: What mistakes or weaknesses appear repeatedly?
3. Key Recurring Themes: What are the most important patterns across all notes?

Format your response as JSON:
{
  "positivePatterns": "Summary of what went well across games",
  "improvementAreas": "Summary of common mistakes and areas to improve",
  "keyThemes": "Key recurring themes and insights"
}`;

    const response = await ai.chat.completions.create({
      model: GPTMiniModel,
      messages: [
        {
          role: "system",
          content:
            "You are a League of Legends coach analyzing gameplay notes. Provide concise, actionable insights. Output JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const summary = JSON.parse(content);

    return NextResponse.json({
      ok: true,
      summary,
      notesAnalyzed: notes.length,
    });
  } catch (err: any) {
    console.error("Failed to summarize notes:", err);
    return NextResponse.json(
      { error: err.message || "unknown" },
      { status: 500 }
    );
  }
}

