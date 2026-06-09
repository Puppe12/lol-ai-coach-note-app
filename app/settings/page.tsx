"use client";
import { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { UserSettings } from "../api/user/settings/route";
import { Button } from "@mantine/core";

export default function SettingsPage() {
  const { settings, updateSettings, isLoading, error } = useSettings();
  const [form, setForm] = useState<UserSettings | null>(null);
  const [responseStatus, setResponseStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSubmit = async () => {
    if (!form) return;
    const result = await updateSettings(form);
    setResponseStatus(result.success ? "success" : "error");

    setTimeout(() => setResponseStatus("idle"), 3000);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>An error occurred while loading data, please try again later.</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <h1 className="text-2xl font-medium mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Manage your in-game preferences
      </p>

      <div className="bg-background border rounded-xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Summoner name
          </label>
          <input
            className="w-full border p-2"
            placeholder={settings.summonerName ?? "e.g. Faker"}
            value={form?.summonerName ?? ""}
            onChange={(e) =>
              setForm((latestForm) =>
                latestForm
                  ? { ...latestForm, summonerName: e.target.value }
                  : latestForm
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            Your League of Legends in-game name
          </p>
        </div>

        <div className="pt-5 flex items-center justify-between gap-4">
          <div className="text-sm">
            {responseStatus === "success" && (
              <span className="text-green-600">Settings saved</span>
            )}
            {responseStatus === "error" && (
              <span className="text-destructive">Failed to save settings</span>
            )}
          </div>
          <Button onClick={handleSubmit}>Save changes</Button>
        </div>
      </div>
    </div>
  );
}
