import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import OpenAI from "openai";

const embeddingModel = process.env.AZURE_OPENAI_EMBEDDINGS!;
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

const embedClient = new OpenAI({
  apiKey,
  baseURL: `${openaiendpoint}/openai/deployments/${embeddingModel}`,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: { "api-key": apiKey },
});

export async function POST(req: Request) {
  try {
    const { text, draft, summonerName } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 1) Auto-tag
    const autoTagRes = await ai.chat.completions.create({
      model: GPTMiniModel,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Extract short, consistent tags. Output JSON only.",
        },
        {
          role: "user",
          content: `Extract gameplay tags from this note:\n${text}\nDraft:\n${JSON.stringify(
            draft
          )}\nReturn {"tags": [...]}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = autoTagRes.choices[0].message.content ?? "{}";
    const tagJson = JSON.parse(content);
    const tags = tagJson.tags || [];

    // 2) Create embedding
    const embed = await embedClient.embeddings.create({
      model: embeddingModel,
      input: text,
    });

    const vector = embed.data[0].embedding;

    // 3) Save to MongoDB
    const client = await clientPromise;
    const db = client.db(mongoDB || "lolcoach");

    // Debug: Log database name
    console.log("Saving to database:", db.databaseName);

    const result = await db.collection("notes").insertOne({
      text,
      draft,
      summonerName,
      ai: {
        tags,
        embedding: vector,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: result.insertedId, tags });
  } catch (err: any) {
    console.error("Failed saving note:", err);
    return NextResponse.json(
      { error: err.message || "unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(mongoDB || "lolcoach");

    // Debug: Log database and collection info
    console.log("Database name:", db.databaseName);
    console.log("Collections:", await db.listCollections().toArray());

    const result = await db.collection("notes").find({}).toArray();
    console.log("Found notes count:", result.length);
    console.log("Sample note:", result[0]);

    return NextResponse.json({ ok: true, notes: result });
  } catch (err: any) {
    console.error("Failed fetching notes:", err);
    return NextResponse.json(
      { error: err.message || "unknown" },
      { status: 500 }
    );
  }
}
