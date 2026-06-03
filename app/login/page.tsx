"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    githubLogin,
    googleLogin,
    emailLogin,
    userId: loggedInUserId,
    isLoading,
  } = useAuth();

  const redirectTo = searchParams.get("callbackUrl") || "/notes";

  useEffect(() => {
    if (!isLoading && loggedInUserId) {
      router.push(redirectTo);
    }
  }, [loggedInUserId, isLoading, router, redirectTo]);

  async function handleGitHubLogin() {
    setLoading(true);
    setError(null);
    try {
      await githubLogin(redirectTo);
    } catch {
      setError("Failed to start GitHub sign-in");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      await googleLogin(redirectTo);
    } catch {
      setError("Failed to start Google sign-in");
      setLoading(false);
    }
  }

  /* TODO: Consider making this into an util if required, also moving it outside of this built function */
  function isEmailValid(email: string) {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  async function handleEmailLogin(email: string) {
    setLoading(true);
    setError(null);

    if (!email || isEmailValid(email) === false) {
      setError("Valid email is required");
      setLoading(false);
      return;
    }

    try {
      await emailLogin(email);
      setEmailSent(true);
    } catch {
      setError("Failed to start Email sign-in");
      setEmailSent(false);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Login to LoL Coach
        </h1>

        {error && (
          <p className="text-[var(--error-text)] text-sm bg-[var(--error-bg)] p-3 rounded-lg border border-[var(--error-border)] mb-4">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || isLoading}
              className="w-full bg-[var(--primary)] text-white px-4 py-3 rounded-lg hover:cursor-pointer hover:bg-[var(--primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Redirecting..." : "Sign in with Google"}
            </button>

            <p className="my-2 text-sm text-[var(--text-muted)] text-center">
              Sign in with your Google Account
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={loading || isLoading}
              className="w-full bg-[var(--primary)] text-white px-4 py-3 rounded-lg hover:cursor-pointer hover:bg-[var(--primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Redirecting..." : "Sign in with GitHub"}
            </button>

            <p className="my-2 text-sm text-[var(--text-muted)] text-center">
              Sign in with your GitHub account
            </p>
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            {emailSent ? (
              <p className="my-2 text-sm text-[var(--text-muted)] text-center">
                A magic link has been sent to your email
              </p>
            ) : (
              <button
                type="button"
                onClick={() => handleEmailLogin(email)}
                disabled={loading || isLoading}
                className="w-full bg-[var(--primary)] my-2 text-white px-4 py-3 rounded-lg hover:cursor-pointer hover:bg-[var(--primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Sending link to email..."
                  : "Sign in with a magic link"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-6 mt-20 text-center text-[var(--text-muted)]">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
