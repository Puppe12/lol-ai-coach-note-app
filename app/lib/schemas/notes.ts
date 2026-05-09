import { z } from "zod";
import { DraftSchema } from "./draft";

// Schema for structured note data (from user input or AI)
export const StructuredNoteDataSchema = z.object({
  matchup: z.string().optional(),
  positive: z.string().optional(),
  improvements: z.string().optional(),
  gameOutcome: z.enum(["victory", "defeat", "unknown"]).optional(),
});

// Schema for AI-generated data within notes
export const NoteAIDataSchema = z.object({
  tags: z.array(z.string()).optional(),
  embedding: z.array(z.number()).optional(),
});

// Schema for creating a new note (POST request body)
export const CreateNoteSchema = z
  .object({
    text: z.string().min(1, "Text is required"),
    draft: DraftSchema.nullable().optional(),
    summonerName: z.string().optional(),
    structured: StructuredNoteDataSchema.optional(),
  })
  .refine((data) => data.text || data.structured, {
    message: "Either text or structured data must be provided",
  });

// Schema for the complete note document (as stored in DB)
export const NoteSchema = z.object({
  _id: z.string(),
  text: z.string().optional(),
  draft: DraftSchema.optional(),
  summonerName: z.string().optional(),
  userId: z.string(),
  ai: NoteAIDataSchema.optional(),
  structured: StructuredNoteDataSchema.optional(),
  createdAt: z.union([z.string(), z.date()]),
});

// Schema for note summarization request
export const SummarizeNotesRequestSchema = z.object({
  noteIds: z.array(z.string()).min(1, "At least one note ID is required"),
});

// Schema for AI summarization response
export const SummarizeNotesResponseSchema = z.object({
  positives: z.string(),
  improvements: z.string(),
  overallSummary: z.string(),
});

// Schema for API response
export const SummarizeNotesAPIResponseSchema = z.object({
  ok: z.boolean(),
  summary: SummarizeNotesResponseSchema,
  notesAnalyzed: z.number(),
});

// Export types
export type StructuredNoteData = z.infer<typeof StructuredNoteDataSchema>;
export type NoteAIData = z.infer<typeof NoteAIDataSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type SummarizeNotesRequest = z.infer<typeof SummarizeNotesRequestSchema>;
export type SummarizeNotesResponse = z.infer<
  typeof SummarizeNotesResponseSchema
>;
