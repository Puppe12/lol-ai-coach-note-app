"use client";

import { useState } from "react";
import { Card, Collapse, Badge, Text, Group, Stack, ActionIcon } from "@mantine/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { parseNoteText } from "../utils/noteParser";
import type { Note } from "@/app/types/note";

type NoteCardProps = {
  note: Note;
};

export default function NoteCard({ note }: NoteCardProps) {
  const [opened, setOpened] = useState(false);

  // Use structured data if available, otherwise parse text
  const hasStructured = !!note.structured;
  const parsed = !hasStructured ? parseNoteText(note.text) : null;

  // Get data from structured or parsed
  const matchup = note.structured?.matchup || parsed?.matchup;
  const positive = note.structured?.positive || parsed?.whatWentWell;
  const improvements = note.structured?.improvements || parsed?.whatWentPoorly;
  const gameOutcome = note.structured?.gameOutcome || note.draft?.gameOutcome;

  // Get draft info for display
  const draftInfo = note.draft?.me || note.draft;
  const champion = draftInfo?.champion;
  const role = draftInfo?.role;
  const opponentChampion = draftInfo?.opponentChampion;

  // Use draft data if available, otherwise use matchup field
  const displayMatchup = champion
    ? `${champion}${role ? ` (${role})` : ""}${
        opponentChampion ? ` vs ${opponentChampion}` : ""
      }`
    : matchup;

  // Format date
  const formatDate = (date?: string | Date) => {
    if (!date) return "Unknown date";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formattedDate = formatDate(note.createdAt);
  const tags = note.ai?.tags || [];

  // Get snippet of improvements (first 2-3 lines)
  const improvementsSnippet = improvements
    ? improvements.split("\n").slice(0, 2).join("\n") +
      (improvements.split("\n").length > 2 ? "..." : "")
    : "";

  // Get outcome badge color
  const getOutcomeBadge = () => {
    if (gameOutcome === "victory") {
      return (
        <Badge color="sageGreen" variant="filled" size="lg">
          Victory
        </Badge>
      );
    } else if (gameOutcome === "defeat") {
      return (
        <Badge color="red" variant="filled" size="lg">
          Defeat
        </Badge>
      );
    }
    return null;
  };

  // Get team composition data
  const allies = note.draft?.teams?.allies;
  const enemies = note.draft?.teams?.enemies;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="hover:shadow-md transition-shadow"
    >
      {/* Collapsed View - Always Visible */}
      <div className="cursor-pointer" onClick={() => setOpened(!opened)}>
        <Group justify="space-between" mb="xs">
          <div className="flex-1">
            <Group gap="xs" mb="xs">
              <Text size="sm" c="dimmed">
                {formattedDate}
              </Text>
              {note.summonerName && (
                <>
                  <Text size="sm" c="dimmed">
                    •
                  </Text>
              <Text size="sm" fw={500} c="sageGreen.7">
                {note.summonerName}
              </Text>
                </>
              )}
              {getOutcomeBadge()}
            </Group>

            {displayMatchup && (
              <Text size="lg" fw={600} c="sageGreen.8" mb="sm">
                {displayMatchup}
              </Text>
            )}

            {/* Show improvements preview when collapsed, if it exists */}
            {!opened && improvements && (
              <div className="bg-rose-50 dark:bg-red-900/20 border border-rose-200/60 dark:border-red-800 rounded-lg p-3 mt-2">
                <Text size="sm" c="dimmed" fw={600} mb={4}>
                  To Improve:
                </Text>
                <Text size="sm" lineClamp={3} style={{ whiteSpace: "pre-wrap" }}>
                  {improvements}
                </Text>
              </div>
            )}
          </div>

          <ActionIcon
            variant="subtle"
            color="sageGreen"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              setOpened(!opened);
            }}
          >
            {opened ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </ActionIcon>
        </Group>
      </div>

      {/* Expanded View - Collapsible */}
      <Collapse in={opened}>
        <Stack gap="md" mt="md">
          {/* Matchup Info (if structured data exists and has matchup) */}
          {note.structured?.matchup && (
            <div>
              <Group gap="xs" mb="xs">
                <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500"></div>
                <Text size="sm" fw={600} tt="uppercase" c="sageGreen.8">
                  Matchup
                </Text>
              </Group>
              <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800 rounded-lg p-4">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {note.structured.matchup}
                </Text>
              </div>
            </div>
          )}

          {/* Team Composition - Allies */}
          {allies && allies.length > 0 && (
            <div>
              <Group gap="xs" mb="xs">
                <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500"></div>
                <Text size="sm" fw={600} tt="uppercase" c="sageGreen.8">
                  Allied Team
                </Text>
              </Group>
              <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800 rounded-lg p-4">
                <Stack gap="xs">
                  {allies.map((ally, idx) => (
                    <Text key={idx} size="sm">
                      {ally.summoner && `${ally.summoner}: `}
                      <span style={{ fontWeight: 600 }}>{ally.champion || "Unknown"}</span>
                    </Text>
                  ))}
                </Stack>
              </div>
            </div>
          )}

          {/* Team Composition - Enemies */}
          {enemies && enemies.length > 0 && (
            <div>
              <Group gap="xs" mb="xs">
                <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500"></div>
                <Text size="sm" fw={600} tt="uppercase" c="sageGreen.8">
                  Enemy Team
                </Text>
              </Group>
              <div className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/60 dark:border-purple-800 rounded-lg p-4">
                <Stack gap="xs">
                  {enemies.map((enemy, idx) => (
                    <Text key={idx} size="sm">
                      {enemy.summoner && `${enemy.summoner}: `}
                      <span style={{ fontWeight: 600 }}>{enemy.champion || "Unknown"}</span>
                    </Text>
                  ))}
                </Stack>
              </div>
            </div>
          )}

          {/* What Went Well */}
          {positive && (
            <div>
              <Group gap="xs" mb="xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-green-500"></div>
                <Text size="sm" fw={600} tt="uppercase" c="sageGreen.8">
                  What Went Well
                </Text>
              </Group>
              <div className="bg-emerald-50/50 dark:bg-green-900/20 border border-emerald-200/60 dark:border-green-800 rounded-lg p-4">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {positive}
                </Text>
              </div>
            </div>
          )}

          {/* What Went Poorly / Improvements */}
          {improvements && (
            <div>
              <Group gap="xs" mb="xs">
                <div className="w-2 h-2 rounded-full bg-rose-400 dark:bg-red-500"></div>
                <Text size="sm" fw={600} tt="uppercase" c="sageGreen.8">
                  Areas for Improvement
                </Text>
              </Group>
              <div className="bg-rose-50/50 dark:bg-red-900/20 border border-rose-200/60 dark:border-red-800 rounded-lg p-4">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {improvements}
                </Text>
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <Text size="sm" fw={600} mb="xs" c="sageGreen.8">
                Tags
              </Text>
              <Group gap="xs">
                {tags.map((tag) => (
                  <Badge key={tag} color="sageGreen" variant="light">
                    #{tag}
                  </Badge>
                ))}
              </Group>
            </div>
          )}

          {/* Fallback: If no structured sections found, show full text (for legacy notes) */}
          {!positive && !improvements && !note.structured?.matchup && note.text && (
            <div>
              <Group gap="xs" mb="xs">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <Text size="sm" fw={600} tt="uppercase" c="sageGreen.8">
                  Note Content
                </Text>
              </Group>
              <div className="bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200/60 dark:border-gray-800 rounded-lg p-4">
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {note.text}
                </Text>
              </div>
            </div>
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}
