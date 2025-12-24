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
    <header className="bg-[var(--sage-medium)] border-b border-[var(--sage-dark)] shadow-sm">
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-white hover:text-[var(--sage-dark)]/80 transition-colors"
        >
          LoL Coach
        </Link>
        <nav className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[var(--sage-dark)]/20 hover:bg-[var(--sage-dark)]/30 transition-colors"
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
                className="text-sm text-white hover:text-[var(--sage-dark)]/80 transition-colors font-medium"
              >
                Notes
              </Link>
            </>
          )}
          {isLoading ? (
            <div className="text-sm text-white/50">Loading...</div>
          ) : userId ? (
            <>
              <span className="text-sm text-[var(--sage-dark)]/70 font-medium">
                {userId}
              </span>
              <button
                onClick={logout}
                className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[var(--sage-dark)] active:bg-[var(--sage-light)] active:text-[var(--sage-dark)] transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[var(--sage-dark)] active:bg-[var(--sage-light)] active:text-[var(--sage-dark)] transition-colors font-medium"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
