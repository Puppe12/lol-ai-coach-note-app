"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function emailSignIn(email: string, callbackUrl: string) {
  try {
    await signIn("nodemailer", { email, callbackUrl, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) {
      console.error("AuthError:", e.type, e.message);
      throw new Error(e.message);
    }
    throw e;
  }
}
