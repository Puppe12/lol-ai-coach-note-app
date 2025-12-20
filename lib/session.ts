import { cookies } from "next/headers";

const USER_ID_COOKIE_NAME = process.env.USERS_COOKIE_SESSION_STORAGE!;

/**
 * Get the current user ID from cookies (server-side)
 */
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_COOKIE_NAME);
  return userId?.value || null;
}

/**
 * Set the user ID in cookies (server-side)
 */
export async function setUserId(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_ID_COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

/**
 * Clear the user ID cookie (server-side)
 */
export async function clearUserId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_ID_COOKIE_NAME);
}

/**
 * Get the current user ID from cookies (client-side)
 */
export function getUserIdClient(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  const userIdCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${USER_ID_COOKIE_NAME}=`)
  );
  if (!userIdCookie) return null;
  return userIdCookie.split("=")[1]?.trim() || null;
}
