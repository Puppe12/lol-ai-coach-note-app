"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GoalsDisplay from "@/app/components/GoalsDisplay";

type Note = {
  _id: string;
  text: string;
  createdAt?: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<any>(null);
  const [loadingGoals, setLoadingGoals] = useState(false);

  async function generateGoals(summonerName: string) {
    setLoadingGoals(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summonerName }),
      });

      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate goals");
    } finally {
      setLoadingGoals(false);
    }
  }

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) {
        throw new Error("Failed to fetch notes");
      }
      const resultJSON = await res.json();
      setNotes(resultJSON.notes);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--sage-dark)]">
          Your Notes
        </h1>
        <Link
          href="/new-note"
          className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[var(--sage-dark)] transition-colors font-medium"
        >
          New Note
        </Link>
      </div>

      {loading && <p className="text-[var(--text-muted)]">Loading notes…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {notes.length === 0 && !loading && (
        <p className="text-[var(--text-muted)]">
          No notes yet — create your first note.
        </p>
      )}

      <ul className="space-y-4">
        {notes.map((note) => {
          const created = note.createdAt
            ? new Date(note.createdAt).toLocaleString()
            : "";
          const preview =
            note.text.length > 300 ? note.text.slice(0, 300) + "…" : note.text;
          return (
            <li
              key={note._id}
              className="p-5 bg-white border border-[var(--sage-light)] rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-muted)]">{created}</p>
                  <p className="mt-2 whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
                    {preview}
                  </p>
                </div>
                {/* placeholder for future actions (view, edit, analyze) */}
                <div className="ml-4 text-right text-xs text-[var(--text-muted)]">
                  <div>id: {String(note._id).slice(-6)}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex gap-3">
        <button
          onClick={loadNotes}
          className="bg-[var(--sage-light)] text-[var(--sage-dark)] px-4 py-2 rounded-lg hover:bg-[var(--sage-medium)] hover:text-white transition-colors font-medium"
        >
          Refresh
        </button>

        <button
          onClick={() => generateGoals("Puppe")}
          disabled={loadingGoals}
          className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg hover:bg-[var(--sage-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingGoals ? "Generating..." : "Generate Goals"}
        </button>
      </div>

      {goals && <GoalsDisplay data={goals} />}
    </div>
  );
}
