import { NextResponse } from "next/server";
import OpenAI from "openai";

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const AZURE_OPENAI_EMBEDDING = process.env.AZURE_OPENAI_EMBEDDING!;

const client = new OpenAI({
  apiKey: AZURE_OPENAI_API_KEY,
  baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_EMBEDDING}`,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: {
    "api-key": AZURE_OPENAI_API_KEY,
  },
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text)
      return NextResponse.json({ error: "text is required" }, { status: 400 });

    const embed = await client.embeddings.create({
      model: AZURE_OPENAI_EMBEDDING,
      input: text,
    });

    const vector = embed.data[0].embedding;

    return NextResponse.json({ vector });
  } catch (err: any) {
    console.error("Embedding error:", err);
    return NextResponse.json(
      { error: err.message || "unknown" },
      { status: 500 }
    );
  }
}
