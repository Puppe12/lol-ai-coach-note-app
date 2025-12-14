import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  defaultQuery: { "api-version": "2024-02-15-preview" },
});
