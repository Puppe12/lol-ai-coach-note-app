"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, userId: loggedInUserId, checkAuth } = useAuth();

  useEffect(() => {
    // Check if already logged in
    if (loggedInUserId) {
      router.push("/notes");
    }
  }, [loggedInUserId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId.trim()) {
      setError("Please enter a username or email");
      setLoading(false);
      return;
    }

    // Validate length
    if (userId.trim().length > 100) {
      setError("Username must be 100 characters or less");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      // Update global auth state
      await login(userId.trim());

      // Redirect to notes page
      router.push("/notes");
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[var(--sage-dark)] mb-6">
          Login to LoL Coach
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-[var(--sage-dark)] mb-2"
            >
              Username or Email
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your username or email"
              className="w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[var(--error-text)] text-sm bg-[var(--error-bg)] p-3 rounded-lg border border-[var(--error-border)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--sage-medium)] text-white px-4 py-3 rounded-lg hover:bg-[var(--sage-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[var(--text-muted)] text-center">
          No password required. Enter your identifier to access your notes.
        </p>
      </div>
    </div>
  );
}
