import { z } from "zod";

export const GoalsSchema = z.object({
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
 * Individual goal schema
 * Reusable for main & secondary goals
 */
export const GoalSchema = z.object({
  title: z
    .string()
    .min(1, "Goal title is required")
    .max(200, "Goal title is too long"),

  description: z.string().max(1000, "Description is too long").optional(),

  source: z.enum(["custom", "recommended"]).optional(),
});

/**
 * User goals payload schema
 */
export const UserGoalsSchema = z.object({
  mainGoal: GoalSchema.extend({
    source: z.enum(["custom", "recommended"]),
  }),

  secondaryGoals: z
    .array(
      GoalSchema.pick({
        title: true,
        description: true,
      })
    )
    .max(3, "You can select up to 3 secondary goals")
    .optional()
    .default([]),
});

export type GoalInput = z.infer<typeof GoalSchema>;
export type UserGoalsInput = z.infer<typeof UserGoalsSchema>;
