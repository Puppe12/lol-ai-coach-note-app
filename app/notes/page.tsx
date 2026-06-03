"use client";

import { useEffect, useState, useMemo } from "react";
import { Pagination } from "@mantine/core";
import NoteCard from "@/app/components/NoteCard";
import GoalsSelection from "../components/GoalsSelection";
import NotesHeader from "@/app/components/NotesHeader";
import NotesFilters from "@/app/components/NotesFilters";
import NotesActions from "@/app/components/NotesActions";
import NotesSummarySection from "@/app/components/NotesSummarySection";
import type { Note } from "@/app/types/note";
import {
  NotificationTypes,
  useNotification,
} from "../contexts/ToastNotificationContext";
type DateFilter = "all" | "today" | "thisWeek" | "thisMonth";
type OutcomeFilter = "all" | "victory" | "defeat";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;

  const { addNotification } = useNotification();

  const [goals, setGoals] = useState<any>(null);
  const [loadingGoals, setLoadingGoals] = useState(false);

  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [selectedGoals, setSelectedGoals] = useState<{
    primary: string | null;
    secondary: string[];
  }>({
    primary: null,
    secondary: [],
  });

  // Filter notes by date and outcome
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Date filter
    /* TODO: Build this into it's own component/util helper */
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((note) => {
        if (!note.createdAt) return false;
        const noteDate = new Date(note.createdAt);
        if (isNaN(noteDate.getTime())) return false;

        switch (dateFilter) {
          case "today":
            return noteDate >= today;
          case "thisWeek":
            return noteDate >= startOfWeek;
          case "thisMonth":
            return noteDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Outcome filter
    if (outcomeFilter !== "all") {
      filtered = filtered.filter((note) => {
        const outcome = note.structured?.gameOutcome || note.draft?.gameOutcome;
        return outcome === outcomeFilter;
      });
    }

    return filtered;
  }, [notes, dateFilter, outcomeFilter]);

  // Paginate filtered notes
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * notesPerPage;
    const endIndex = startIndex + notesPerPage;
    return filteredNotes.slice(startIndex, endIndex);
  }, [filteredNotes, currentPage]);

  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, outcomeFilter]);

  async function generateGoals() {
    setLoadingGoals(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to generate goals");
      }

      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate goals");
    } finally {
      setLoadingGoals(false);
    }
  }

  async function summarizeNotes() {
    if (filteredNotes.length === 0) return;

    setLoadingSummary(true);
    try {
      const noteIds = filteredNotes.map((note) => note._id);

      const res = await fetch("/api/notes/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteIds }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to summarize notes");
      }

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      alert("Failed to summarize notes");
    } finally {
      setLoadingSummary(false);
    }
  }

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-6 flex justify-center">
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={handlePageChange}
          color="sageGreen"
          size="md"
        />
      </div>
    );
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      if (!res.ok) {
        throw new Error("Failed to delete note");
      }
      loadNotes();
      addNotification({
        message: "Note deleted successfully",
        type: NotificationTypes.success,
        duration: 10000,
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      addNotification({
        message: "Failed to delete note",
        type: NotificationTypes.error,
        duration: 10000,
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8 lg:px-0">
      <NotesHeader totalNotes={notes.length} />

      <NotesFilters
        dateFilter={dateFilter}
        outcomeFilter={outcomeFilter}
        totalFiltered={filteredNotes.length}
        onDateFilterChange={(value) => setDateFilter(value as DateFilter)}
        onOutcomeFilterChange={(value) =>
          setOutcomeFilter(value as OutcomeFilter)
        }
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        {/* Left column: list, loading, errors */}
        <section>
          {/* Loading State */}
          {loading && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
              <p className="text-[var(--text-muted)]">Loading notes…</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Error loading notes
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredNotes.length === 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
              <p className="mb-2 text-lg text-[var(--foreground)]">
                {dateFilter === "all"
                  ? "No notes yet — create your first note."
                  : `No notes found for ${
                      dateFilter === "today"
                        ? "today"
                        : dateFilter === "thisWeek"
                          ? "this week"
                          : "this month"
                    }.`}
              </p>
              {dateFilter !== "all" && (
                <button
                  onClick={() => setDateFilter("all")}
                  className="text-sm font-medium text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
                >
                  Show all notes
                </button>
              )}
            </div>
          )}

          {/* Notes List */}
          {!loading && !error && paginatedNotes.length > 0 && (
            <div className="space-y-4">
              {paginatedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </section>

        {/* Right column: actions, summary, goals */}
        <section className="space-y-6">
          <NotesActions
            hasNotes={filteredNotes.length > 0}
            loadingSummary={loadingSummary}
            loadingGoals={loadingGoals}
            onRefresh={loadNotes}
            onSummarize={summarizeNotes}
            onGenerateGoals={generateGoals}
          />

          <NotesSummarySection
            summary={summary}
            noteCount={filteredNotes.length}
          />

          {goals && (
            <div>
              <GoalsSelection goals={goals} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
