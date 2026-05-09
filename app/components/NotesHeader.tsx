"use client";

import Link from "next/link";

type NotesHeaderProps = {
  totalNotes: number;
};

export default function NotesHeader({ totalNotes }: NotesHeaderProps) {
  const hasNotes = totalNotes > 0;

  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
          Your notes
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {hasNotes
            ? `${totalNotes} note${totalNotes === 1 ? "" : "s"} saved so far.`
            : "No notes yet — log your next game right after it ends."}
        </p>
      </div>
      <Link
        href="/new-note"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-dark)]"
      >
        New note
      </Link>
    </header>
  );
}

