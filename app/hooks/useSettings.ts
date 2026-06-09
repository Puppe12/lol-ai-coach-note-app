import useSWR from "swr";
import { UserSettings } from "../api/user/settings/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSettings() {
  const { data, mutate, error } = useSWR("/api/user/settings", fetcher);

  const updateSettings = async (settings: UserSettings) => {
    try {
      const result = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!result.ok) throw new Error("Failed to save settings");
      await mutate(); // useSWT Function that revalidates data be re-rendering fetcher GET-call -> data gets updated
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    settings: data,
    updateSettings,
    isLoading: !data,
    error,
  };
}
