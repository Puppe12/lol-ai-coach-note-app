"use client";

import { Button, Group, Text } from "@mantine/core";

type NotesActionsProps = {
  hasNotes: boolean;
  loadingSummary: boolean;
  loadingGoals: boolean;
  onRefresh: () => void;
  onSummarize: () => void;
  onGenerateGoals: () => void;
};

export default function NotesActions({
  hasNotes,
  loadingSummary,
  loadingGoals,
  onRefresh,
  onSummarize,
  onGenerateGoals,
}: NotesActionsProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text size="sm" fw={600} c="sageGreen.8">
            Review tools
          </Text>
          <Text size="xs" c="dimmed">
            Refresh your data, get an AI summary, or generate focused goals from
            the games you’re looking at.
          </Text>
        </div>
      </div>

      <Group gap="xs" className="flex-wrap">
        <Button
          variant="subtle"
          color="sageGreen"
          onClick={onRefresh}
          size="xs"
        >
          Refresh notes
        </Button>

        <Button
          onClick={onSummarize}
          disabled={!hasNotes || loadingSummary}
          loading={loadingSummary}
          color="sageGreen"
          variant="light"
          size="xs"
        >
          Summarize visible notes
        </Button>

        <Button
          onClick={onGenerateGoals}
          disabled={!hasNotes || loadingGoals}
          loading={loadingGoals}
          color="sageGreen"
          size="xs"
        >
          Generate goals
        </Button>
      </Group>

      {!hasNotes && (
        <Text size="xs" c="dimmed" mt="sm">
          Add or unfilter notes to enable AI summary and goal generation.
        </Text>
      )}
    </section>
  );
}

