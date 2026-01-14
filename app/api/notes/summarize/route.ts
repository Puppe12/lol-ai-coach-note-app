import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserId } from "@/lib/session";
import OpenAI from "openai";
import { ObjectId } from "mongodb";
import { SummarizeNotesRequestSchema, SummarizeNotesResponseSchema } from "@/app/lib/schemas/notes";
import { ZodError } from "zod";

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

    // Validate request body
    const body = await req.json();
    const { noteIds } = SummarizeNotesRequestSchema.parse(body);

    // Fetch notes from MongoDB
    const client = await clientPromise;
    const db = client.db(mongoDB || "lolcoach");

    /* TODO: These notes need to be typed properly */
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


      /* TODO: Need to add a feature that the users can give feedback on the summary and the AI will improve the summary based on the feedback
        Currently the summary might be a bit too general and doesn't summarize the player's actual noted concepts and issues
      */
    // Generate summary using AI
    const prompt = `
    Summarize the following gameplay notes into a clear, neutral overview.
    
    Notes:
    ${notesContent}
    
    Create a summary that:
    - Combines similar observations
    - Rephrases the notes in clearer language
    - Reflects exactly what was written, without adding new conclusions
    - Generalizes behavior instead of talking about specific games or champions
    
    Return STRICT JSON in this EXACT format:
    {
      "positives": "string - what the notes say went well",
      "improvements": "string - what the notes say needs improvement",
      "overallSummary": "string - high-level summary of the notes"
    }
    
    VALIDATION RULES:
    - ALL three fields are REQUIRED and must be non-empty strings
    - If no information exists for a field, write a neutral sentence like:
      "No specific positives mentioned in these notes."
    - NEVER return null, undefined, or empty strings
    - MUST NOT include champion names, matchups, or single-game events
    - MUST summarize as general tendencies, themes, or behaviors
    
    Example (style only):
    {
      "positives": "The notes describe strong early pressure, confident engagements, and meaningful contribution to team plays.",
      "improvements": "The notes mention occasional issues with positioning, late-game decision making, and consistency in map presence.",
      "overallSummary": "Overall, the notes suggest generally solid impact with some recurring decision-making and positioning challenges in later stages."
    }
    `;

    const response = await ai.chat.completions.create({
      model: GPTMiniModel,
      messages: [
        {
          role: "system",
          content: `
        You summarize gameplay notes into a neutral, generalized performance overview.
        
        STRICT RULES:
        - Do NOT mention specific champions, matchups, team compositions, lanes, or characters.
        - Do NOT reference individual games, single events, or timestamps.
        - Do NOT describe what happened in specific situations.
        - Do NOT treat champions as players.
        - Do NOT critique the quality or completeness of the notes.
        - Do NOT add coaching advice, goals, or recommendations.
        - Do NOT generalize beyond what is explicitly written.
        
        ABSTRACTION RULE:
        - Always generalize into broader recurring themes, patterns, or behaviors.
        - Combine similar points into clearer unified statements.
        - If something appears only once, still include it as a general tendency.
        - Output ONLY generalized tendencies and themes.
        
        Your job:
        - Paraphrase and condense what the notes already say
        - Preserve original intent and meaning
        - Output JSON only.
        `
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

    const parsedContent = JSON.parse(content);
    
    // Validate AI response
    const summary = SummarizeNotesResponseSchema.parse(parsedContent);

    return NextResponse.json({
      ok: true,
      summary,
      notesAnalyzed: notes.length,
    });
  } catch (err: any) {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      console.error("Validation error:", err.issues);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", "),
          issues: err.issues 
        },
        { status: 400 }
      );
    }
    
    console.error("Failed to summarize notes:", err);
    return NextResponse.json(
      { error: err.message || "unknown" },
      { status: 500 }
    );
  }
}
