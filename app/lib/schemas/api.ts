import { z } from "zod";

// Common error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  issues: z.any().optional(),
});

// Common success response schema
export const SuccessResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string().optional(),
});

// Authentication error
export const AuthErrorSchema = z.object({
  error: z.literal("Authentication required"),
});

// Generic list response wrapper
export function createListResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    ok: z.boolean(),
    items: z.array(itemSchema),
    total: z.number().optional(),
  });
}

// Export types
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type AuthError = z.infer<typeof AuthErrorSchema>;