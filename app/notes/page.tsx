"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import GoalsDisplay from "@/app/components/GoalsDisplay";
import NoteCard from "@/app/components/NoteCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { SegmentedControl, Pagination, Button, Group, Accordion, Text, Stack } from "@mantine/core";
import type { Note } from "@/app/types/note";

type DateFilter = "all" | "today" | "thisWeek" | "thisMonth";
type OutcomeFilter = "all" | "victory" | "defeat";

export default function NotesPage() {
  const router = useRouter();
  const { userId, isLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 10;

  const [goals, setGoals] = useState<any>(null);
  const [loadingGoals, setLoadingGoals] = useState(false);

  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Filter notes by date and outcome
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Date filter
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

  const renderPaginationOld = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current page range, ellipsis, last page
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // In the middle
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--sage-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, idx) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-[var(--text-muted)]"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-[var(--sage-medium)] text-white font-semibold"
                    : "bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--sage-light)]"
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--sage-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--sage-dark)]">
          Your Notes
        </h1>
        <Link
          href="/new-note"
          className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[var(--sage-dark)] transition-colors font-medium"
        >
          New Note
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        <div>
          <Text size="sm" fw={500} c="sageGreen.8" mb="xs">
            Filter by date:
          </Text>
          <SegmentedControl
            value={dateFilter}
            onChange={(value) => setDateFilter(value as DateFilter)}
            data={[
              { label: "All Time", value: "all" },
              { label: "Today", value: "today" },
              { label: "This Week", value: "thisWeek" },
              { label: "This Month", value: "thisMonth" },
            ]}
            color="sageGreen"
          />
        </div>

        <div>
          <Text size="sm" fw={500} c="sageGreen.8" mb="xs">
            Filter by outcome:
          </Text>
          <SegmentedControl
            value={outcomeFilter}
            onChange={(value) => setOutcomeFilter(value as OutcomeFilter)}
            data={[
              { label: "All Games", value: "all" },
              { label: "Victories", value: "victory" },
              { label: "Defeats", value: "defeat" },
            ]}
            color="sageGreen"
          />
        </div>

        <Text size="sm" c="dimmed">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""} found
        </Text>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)]">Loading notes…</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotes.length === 0 && (
        <div className="text-center py-12 bg-[var(--card-bg)] border-2 border-[var(--border)] rounded-xl">
          <p className="text-[var(--text-muted)] text-lg mb-2">
            {dateFilter === "all"
              ? "No notes yet — create your first note."
              : `No notes found for ${dateFilter === "today" ? "today" : dateFilter === "thisWeek" ? "this week" : "this month"}.`}
          </p>
          {dateFilter !== "all" && (
            <button
              onClick={() => setDateFilter("all")}
              className="text-[var(--sage-medium)] hover:text-[var(--sage-dark)] font-medium"
            >
              Show all notes
            </button>
          )}
        </div>
      )}

      {/* Notes List */}
      {!loading && paginatedNotes.length > 0 && (
        <div className="space-y-4">
          {paginatedNotes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Action Buttons */}
      <Group mt="xl" gap="md">
        <Button onClick={loadNotes} variant="light" color="sageGreen">
          Refresh
        </Button>

        <Button
          onClick={summarizeNotes}
          disabled={loadingSummary || filteredNotes.length === 0}
          color="sageGreen"
          variant="light"
          loading={loadingSummary}
        >
          Summarize Visible Notes
        </Button>

        <Button
          onClick={generateGoals}
          disabled={loadingGoals || filteredNotes.length === 0}
          color="sageGreen"
          loading={loadingGoals}
        >
          Generate Goals
        </Button>
      </Group>

      {/* Summary Display */}
      {summary && (
        <Accordion mt="xl" variant="separated" radius="md">
          <Accordion.Item value="summary">
            <Accordion.Control>
              <Text fw={600} size="lg" c="sageGreen.8">
                AI Summary of {filteredNotes.length} Notes
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <div>
                  <Group gap="xs" mb="xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <Text fw={600} size="sm" tt="uppercase" c="sageGreen.8">
                      Common Positive Patterns
                    </Text>
                  </Group>
                  <div className="bg-emerald-50/50 dark:bg-green-900/20 border border-emerald-200/60 dark:border-green-800 rounded-lg p-4">
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {summary.positivePatterns}
                    </Text>
                  </div>
                </div>

                <div>
                  <Group gap="xs" mb="xs">
                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                    <Text fw={600} size="sm" tt="uppercase" c="sageGreen.8">
                      Common Areas for Improvement
                    </Text>
                  </Group>
                  <div className="bg-rose-50/50 dark:bg-red-900/20 border border-rose-200/60 dark:border-red-800 rounded-lg p-4">
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {summary.improvementAreas}
                    </Text>
                  </div>
                </div>

                <div>
                  <Group gap="xs" mb="xs">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <Text fw={600} size="sm" tt="uppercase" c="sageGreen.8">
                      Key Recurring Themes
                    </Text>
                  </Group>
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800 rounded-lg p-4">
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {summary.keyThemes}
                    </Text>
                  </div>
                </div>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {/* Goals Display */}
      {goals && <GoalsDisplay data={goals} />}
    </div>
  );
}
