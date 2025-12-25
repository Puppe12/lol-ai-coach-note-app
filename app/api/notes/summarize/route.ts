import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserId } from "@/lib/session";
import OpenAI from "openai";
import { ObjectId } from "mongodb";

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
        _id: { $in: noteIds.map((id) => new ObjectId(id)) },
        userId,
      })
      .toArray();

    if (notes.length === 0) {
      return NextResponse.json({ error: "No notes found" }, { status: 404 });
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
    const prompt = `
      Summarize the following gameplay notes into a clear, neutral overview.

      Notes:
      ${notesContent}

      Create a summary that:
      - Combines similar observations
      - Rephrases the notes in clearer language
      - Reflects exactly what was written, without adding new conclusions

      Return JSON in this format:
      {
        "positives": "What the notes say went well",
        "improvements": "What the notes say needs improvement",
        "overallSummary": "High-level summary of the notes"
      }
      `;

    const response = await ai.chat.completions.create({
      model: GPTMiniModel,
      messages: [
        {
          role: "system",
          content: `
        You summarize existing notes only.
        
        Rules:
        - Do NOT critique the quality, completeness, or amount of the notes.
        - Do NOT mention missing information or lack of detail.
        - Do NOT add coaching advice, goals, or recommendations.
        - Do NOT generalize beyond what is explicitly written.
        - Do not talk about specific character matchups unless specifically mentioned
        
        Your task is to:
        - Paraphrase and condense what the notes already say
        - Combine similar points into a clearer summary
        - Preserve the original intent and meaning
        
        If something appears only once, still include it.
        If information is sparse, mention that more data is needed but also include the summary neutrally.
        
        Output JSON only.
        `,
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
