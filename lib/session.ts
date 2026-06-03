import { auth } from "@/auth";

/**
 * Get the current user ID from the NextAuth session (server-side).
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  console.log("session:", session);
  return session?.user?.id ?? null;
}
