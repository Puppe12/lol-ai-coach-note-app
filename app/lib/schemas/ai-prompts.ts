import { z } from "zod";

/**
 * Schema for AI-generated tags from notes
 * Used in: /api/notes (POST) and /api/autotag
 */
export const AITagsResponseSchema = z.object({
  tags: z.array(z.string()),
  explanations: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for AI-generated goals analysis
 * Used in: /api/goals (POST)
 */
export const AIGoalsResponseSchema = z.object({
  improvementAreas: z.array(z.string()),
  recommendedGoals: z.array(
    z.object({
      goal: z.string(),
      reasoning: z.string(),
    })
  ),
  suggestions: z.array(
    z.object({
      goal: z.string(),
      suggestion: z.string(),
    })
  ),
  longTermGoals: z.array(z.string()),
  skillPlan: z.object({
    laning: z.array(z.string()),
    midgame: z.array(z.string()),
    macro: z.array(z.string()),
    mechanics: z.array(z.string()),
  }),
});

/**
 * Schema for a player in a team
 */
const TeamPlayerSchema = z.object({
  summoner: z.string(),
  champion: z.string(),
  team: z.enum(["ally", "enemy"]),
});

/**
 * Schema for AI-generated draft analysis from image
 * Used in: /api/draft (POST)
 */
export const AIDraftAnalysisSchema = z.object({
  me: z.object({
    summoner: z.string(),
    champion: z.string(),
    role: z.string(),
    opponentChampion: z.string(),
  }),
  teams: z.object({
    allies: z.array(TeamPlayerSchema),
    enemies: z.array(TeamPlayerSchema),
  }),
  gameOutcome: z.enum(["victory", "defeat", "unknown"]),
});

/**
 * Schema for AI-generated note summary
 * Used in: /api/notes/summarize (POST)
 */
export const AISummaryResponseSchema = z.object({
  positives: z.string(),
  improvements: z.string(),
  overallSummary: z.string(),
});

// Export types
export type AITagsResponse = z.infer<typeof AITagsResponseSchema>;
export type AIGoalsResponse = z.infer<typeof AIGoalsResponseSchema>;
export type AIDraftAnalysis = z.infer<typeof AIDraftAnalysisSchema>;
export type AISummaryResponse = z.infer<typeof AISummaryResponseSchema>;