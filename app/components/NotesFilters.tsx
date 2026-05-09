"use client";

import { SegmentedControl, Text } from "@mantine/core";

type NotesFiltersProps = {
  dateFilter: string;
  outcomeFilter: string;
  totalFiltered: number;
  onDateFilterChange: (value: string) => void;
  onOutcomeFilterChange: (value: string) => void;
};

export default function NotesFilters({
  dateFilter,
  outcomeFilter,
  totalFiltered,
  onDateFilterChange,
  onOutcomeFilterChange,
}: NotesFiltersProps) {
  return (
    <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Filters
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Narrow down which games you’re reviewing right now.
          </p>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {totalFiltered} note{totalFiltered === 1 ? "" : "s"} in view
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Text size="xs" fw={500} c="sageGreen.8" mb={6}>
            Date
          </Text>
          <SegmentedControl
            value={dateFilter}
            onChange={onDateFilterChange}
            data={[
              { label: "All time", value: "all" },
              { label: "Today", value: "today" },
              { label: "This week", value: "thisWeek" },
              { label: "This month", value: "thisMonth" },
            ]}
            color="sageGreen"
            radius="xl"
            size="sm"
            fullWidth
          />
        </div>

        <div className="flex-1">
          <Text size="xs" fw={500} c="sageGreen.8" mb={6}>
            Outcome
          </Text>
          <SegmentedControl
            value={outcomeFilter}
            onChange={onOutcomeFilterChange}
            data={[
              { label: "All games", value: "all" },
              { label: "Victories", value: "victory" },
              { label: "Defeats", value: "defeat" },
            ]}
            color="sageGreen"
            radius="xl"
            size="sm"
            fullWidth
          />
        </div>
      </div>
    </section>
  );
}

