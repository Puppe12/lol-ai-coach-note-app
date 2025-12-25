"use client";

import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const { userId, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = userId !== null;

  return (
    <header
      id="main-header"
      style={{ background: "var(--header-bg)" }}
      className="border-b border-[var(--sage-dark)] dark:border-[var(--border)] shadow-sm"
    >
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-white hover:text-[var(--sage-light)] transition-colors"
        >
          LoL Coach
        </Link>
        <nav className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-white" />
            ) : (
              <Sun className="w-5 h-5 text-white" />
            )}
          </button>
          {isLoggedIn && (
            <>
              <Link
                href="/new-note"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium"
              >
                New Note
              </Link>
              <Link
                href="/notes"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium"
              >
                Notes
              </Link>
            </>
          )}
          {isLoading ? (
            <div className="text-sm text-white/50">Loading...</div>
          ) : userId ? (
            <>
              <span className="text-sm text-white/70 font-medium">
                {userId}
              </span>
              <button
                onClick={logout}
                className="bg-white/10 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-white/20 transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-white/10 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-white/20 transition-colors font-medium"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
