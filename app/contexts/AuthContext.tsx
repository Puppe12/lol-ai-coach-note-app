"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  SessionProvider,
  useSession,
  signIn,
  signOut,
  type SessionProviderProps,
} from "next-auth/react";
import { emailSignIn } from "../actions/serverAuth";

interface AuthContextType {
  userId: string | null;
  userName: string | null;
  isLoading: boolean;
  githubLogin: (callbackUrl?: string) => Promise<void>;
  googleLogin: (callbackUrl?: string) => Promise<void>;
  emailLogin: (email: string, callbackUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const userId = session?.user?.id ?? null;
  const userName = session?.user?.name ?? session?.user?.email ?? null;
  const isLoading = status === "loading";

  const githubLogin = async (callbackUrl = "/notes") => {
    await signIn("github", { callbackUrl });
  };

  const googleLogin = async (callbackUrl = "/notes") => {
    await signIn("google", { callbackUrl });
  };

  const emailLogin = async (email: string, callbackUrl = "/notes") => {
    try {
      await emailSignIn(email, callbackUrl);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        isLoading,
        githubLogin,
        googleLogin,
        emailLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({
  children,
  session,
}: {
  children: ReactNode;
  session?: SessionProviderProps["session"];
}) {
  return (
    <SessionProvider session={session}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
