import { z } from "zod";

// Schema for a player in a team
export const playerSchema = z.object({
  summoner: z.string(),
  champion: z.string(),
  team: z.enum(["ally", "enemy"]),
});

// Request schema for draft image upload
export const DraftImageUploadSchema = z.object({
  image: z.instanceof(File),
  summonerName: z.string().min(1, "Summoner name is required"),
});

// Main draft schema (from AI response or manual input)
export const DraftSchema = z.object({
  me: z.object({
    summoner: z.string(),
    champion: z.string(),
    role: z.string(),
    opponentChampion: z.string(),
  }),
  teams: z.object({
    allies: z.array(playerSchema),
    enemies: z.array(playerSchema),
  }),
  gameOutcome: z.enum(["victory", "defeat", "unknown"]),
});

export type Player = z.infer<typeof playerSchema>;
export type Draft = z.infer<typeof DraftSchema>;
export type DraftImageUpload = z.infer<typeof DraftImageUploadSchema>;