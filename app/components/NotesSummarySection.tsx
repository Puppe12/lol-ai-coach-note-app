"use client";

import { Accordion, Group, Stack, Text } from "@mantine/core";

type Summary = {
  overallSummary?: string;
  positives?: string;
  improvements?: string;
};

type NotesSummarySectionProps = {
  summary: Summary | null;
  noteCount: number;
};

export default function NotesSummarySection({
  summary,
  noteCount,
}: NotesSummarySectionProps) {
  if (!summary) return null;

  return (
    <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-5">
      <Accordion variant="separated" radius="md" chevronPosition="right">
        <Accordion.Item value="summary">
          <Accordion.Control>
            <Text fw={600} size="sm" c="sageGreen.8">
              AI summary of {noteCount} note{noteCount === 1 ? "" : "s"}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md" mt="sm">
              {summary.overallSummary && (
                <div>
                  <Group gap="xs" mb="xs">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <Text fw={600} size="xs" tt="uppercase" c="sageGreen.8">
                      Overall summary
                    </Text>
                  </Group>
                  <div className="rounded-lg border border-blue-200/60 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {summary.overallSummary}
                    </Text>
                  </div>
                </div>
              )}

              {summary.positives && (
                <div>
                  <Group gap="xs" mb="xs">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <Text fw={600} size="xs" tt="uppercase" c="sageGreen.8">
                      What went well
                    </Text>
                  </Group>
                  <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {summary.positives}
                    </Text>
                  </div>
                </div>
              )}

              {summary.improvements && (
                <div>
                  <Group gap="xs" mb="xs">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <Text fw={600} size="xs" tt="uppercase" c="sageGreen.8">
                      Areas for improvement
                    </Text>
                  </Group>
                  <div className="rounded-lg border border-rose-200/60 bg-rose-50/50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {summary.improvements}
                    </Text>
                  </div>
                </div>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </section>
  );
}

