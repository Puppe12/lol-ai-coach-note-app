"use client";

import { useState } from "react";
import {
  Card,
  Text,
  Stack,
  Checkbox,
  Radio,
  TextInput,
  Button,
} from "@mantine/core";
import { RecommendedGoal, GoalsData } from "../lib/types";
import { UserGoalsSchema } from "../lib/schemas/goals";

type SelectedGoal = {
  title: string;
  description?: string;
  isMain: boolean;
};

type Props = {
  goals: GoalsData;
};

export default function GoalsSelection({ goals }: Props) {
  const [primary, setPrimary] = useState<SelectedGoal | null>(null);
  const [secondary, setSecondary] = useState<SelectedGoal[]>([]);
  const [customPrimary, setCustomPrimary] = useState("");

  async function saveGoals() {
    if (!primary) return;

    const payload = {
      mainGoal: {
        title: primary.title,
        description: primary.description ?? "",
        source: customPrimary ? "custom" : "recommended",
      },
      secondaryGoals: secondary.map((g) => ({
        title: g.title,
        description: "",
      })),
    };

    const parsed = UserGoalsSchema.safeParse(payload);

    if (!parsed.success) {
      console.error(parsed.error.flatten());
      return;
    }

    await fetch("/api/goals/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  }

  return (
    <Stack mt="xl">
      {/* Primary Goal */}
      <Card withBorder>
        <Text fw={600} mb="sm">
          Select ONE Primary Goal
        </Text>

        <Stack>
          <TextInput
            label="Set your own main goal"
            placeholder="Get better at farming..."
            value={customPrimary}
            onChange={(e) => {
              const value = e.currentTarget.value;
              setCustomPrimary(value);

              if (value.trim()) {
                setPrimary({
                  title: value,
                  isMain: true,
                });
              }
            }}
          />

          <Radio.Group
            value={primary?.title ?? ""}
            onChange={(value) => {
              setCustomPrimary("");
              setPrimary({
                title: value,
                isMain: true,
              });
            }}
          >
            <Stack>
              {goals.recommendedGoals.map((g: RecommendedGoal) => (
                <Radio key={g.goal} value={g.goal} label={g.goal} />
              ))}
            </Stack>
          </Radio.Group>
        </Stack>
      </Card>

      {/* Secondary Goals */}
      {primary && (
        <Card withBorder>
          <Text fw={600} mb="sm">
            Select up to 3 Secondary Goals
          </Text>

          <Stack>
            {goals.recommendedGoals
              .map((g) => g.goal)
              .filter((goal) => goal !== primary.title)
              .map((goal) => {
                const selected = secondary.some((s) => s.title === goal);

                return (
                  <Checkbox
                    key={goal}
                    label={goal}
                    checked={selected}
                    disabled={!selected && secondary.length >= 3}
                    onChange={() => {
                      setSecondary((prev) =>
                        selected
                          ? prev.filter((g) => g.title !== goal)
                          : [...prev, { title: goal, isMain: false }].slice(
                              0,
                              3
                            )
                      );
                    }}
                  />
                );
              })}
          </Stack>

          <Text size="xs" c="dimmed" mt="sm">
            {secondary.length}/3 selected
          </Text>
        </Card>
      )}

      {/* Save Button */}
      <Button mt="md" disabled={!primary} onClick={saveGoals}>
        Save goals
      </Button>
    </Stack>
  );
}
