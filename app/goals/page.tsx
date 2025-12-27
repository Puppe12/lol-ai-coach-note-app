"use client";

import { useEffect, useState } from "react";
import { Card, Text, Stack, Title, Divider } from "@mantine/core";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoals() {
      try {
        const res = await fetch("/api/goals");
        const data = await res.json();
        setGoals(data.goals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Text c="dimmed">Loading goals…</Text>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Text c="dimmed">No goals generated yet.</Text>
      </div>
    );
  }

  const { mainGoal, secondaryGoals } = goals;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Title order={2} c="sageGreen.8">
        Your Current Goals
      </Title>

      {/* Main Goal */}
      {mainGoal && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={700} size="sm" tt="uppercase" c="sageGreen.8" mb="xs">
            Main Focus
          </Text>
          <Title order={4}>{mainGoal.title}</Title>

          {mainGoal.description && (
            <Text mt="sm" c="dimmed">
              {mainGoal.description}
            </Text>
          )}
        </Card>
      )}

      <Divider />

      {/* Secondary Goals */}
      {secondaryGoals?.length > 0 && (
        <Stack gap="md">
          <Text fw={700} size="sm" tt="uppercase" c="sageGreen.8">
            Secondary Goals
          </Text>

          {secondaryGoals.map((goal: any, idx: number) => (
            <Card key={idx} shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={500}>{goal.title}</Text>
              {goal.description && (
                <Text size="sm" c="dimmed" mt="xs">
                  {goal.description}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </div>
  );
}
