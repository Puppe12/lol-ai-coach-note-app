"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ErrorNotification from "@/app/components/ErrorNotification";

export default function NewNotePage() {
  const router = useRouter();
  const { userId } = useAuth();

  // Separate fields for better UX
  const [matchup, setMatchup] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatWentPoorly, setWhatWentPoorly] = useState("");
  const [username, setUsername] = useState(userId || "");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [draftResult, setDraftResult] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [gameOutcome, setGameOutcome] = useState<
    "victory" | "defeat" | "unknown"
  >("unknown");

  // Tagging related state
  const [tags, setTags] = useState<string[]>([]);
  const [tagging, setTagging] = useState(false);
  const [tagExplanations, setTagExplanations] = useState<
    Record<string, string>
  >({});

  // Error state
  const [error, setError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  // Auto-populate matchup and game outcome when draft analysis completes
  useEffect(() => {
    if (draftResult?.me) {
      const { champion, role, opponentChampion } = draftResult.me;
      let matchupText = "";

      if (champion) {
        matchupText = champion;
        if (role) matchupText += ` (${role})`;
        if (opponentChampion) matchupText += ` vs ${opponentChampion}`;
      }

      setMatchup(matchupText);
    }

    // Set game outcome from draft analysis if available
    if (draftResult?.gameOutcome) {
      setGameOutcome(draftResult.gameOutcome);
    }
  }, [draftResult]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;

    setLoadingDraft(true);
    setError(null); // Clear any previous errors
    const form = new FormData();
    form.append("image", imageFile);
    if (username) {
      form.append("summonerName", username);
    }

    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError({
          message: "Failed to analyze image",
          details:
            data.details ||
            data.error ||
            "Please check your image and try again",
        });
        return;
      }

      setDraftResult(data);
    } catch (error: any) {
      setError({
        message: "Failed to analyze image",
        details: error.message || "Network error occurred",
      });
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setError(null); // Clear any previous errors

    if (!matchup.trim() && !draftResult) {
      setError({
        message: "Missing matchup information",
        details:
          "Please add a draft image and analyze it, or manually enter matchup info",
      });
      return;
    }

    if (!whatWentWell.trim() && !whatWentPoorly.trim()) {
      setError({
        message: "Missing game notes",
        details: "Please write what went well or poorly in this game",
      });
      return;
    }

    // Combine all fields into note text for backend (backup/legacy)
    const noteText = `${matchup}\n\nWhat went well:\n${whatWentWell}\n\nWhat went poorly:\n${whatWentPoorly}`;

    // Prepare structured data
    const structured = {
      matchup: matchup.trim() || undefined,
      positive: whatWentWell.trim() || undefined,
      improvements: whatWentPoorly.trim() || undefined,
      gameOutcome,
    };

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: noteText,
          draft: draftResult,
          summonerName: username || "",
          tags,
          structured,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        setError({
          message: "Failed to save note",
          details: data.error || "Please try again",
        });
        return;
      }

      // Reset form
      setMatchup("");
      setWhatWentWell("");
      setWhatWentPoorly("");
      setImageFile(null);
      setDraftResult(null);
      setTags([]);
      setGameOutcome("unknown");
      setError(null);

      alert("Note saved successfully!");
      router.push("/notes");
    } catch (error: any) {
      setError({
        message: "Failed to save note",
        details: error.message || "Network error occurred",
      });
    }
  };

  async function runAutotag() {
    const noteText = `${matchup}\n\nWhat went well:\n${whatWentWell}\n\nWhat went poorly:\n${whatWentPoorly}`;

    setError(null); // Clear any previous errors

    if (!noteText.trim()) {
      setError({
        message: "Cannot generate tags",
        details: "Write some notes first before auto-tagging",
      });
      return;
    }

    setTagging(true);
    try {
      const res = await fetch("/api/autotag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText, draft: draftResult ?? null }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("autotag error", data);
        setError({
          message: "Auto-tagging failed",
          details: data?.error ?? "Please try again",
        });
      } else {
        setTags(data.tags || []);
        setTagExplanations(data.explanations || {});
      }
    } catch (e: any) {
      console.error(e);
      setError({
        message: "Auto-tagging failed",
        details: e.message || "Network error occurred",
      });
    } finally {
      setTagging(false);
    }
  }

  // Determine which step the user is on
  const hasImage = !!imageFile;
  const hasAnalysis = !!draftResult;
  const hasContent =
    matchup.trim() || whatWentWell.trim() || whatWentPoorly.trim();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sage-dark)] mb-2">
          Create New Game Note
        </h1>
        <p className="text-[var(--text-muted)]">
          Follow the steps below to create a detailed note about your game
        </p>
      </div>

      {/* Error Notification */}
      {error && (
        <ErrorNotification
          message={error.message}
          details={error.details}
          onClose={() => setError(null)}
        />
      )}

      {/* Step Flow Indicator */}
      {/* TODO make this into a better solution, some sort of state-checker for steps instead of individual booleans? */}
      <div className="bg-gradient-to-r from-[var(--sage-light)] to-[var(--sage-medium)] rounded-lg p-6 mb-6 border-2 border-[var(--border)]">
        <div className="flex items-center justify-between text-sm">
          <div
            className={`flex items-center gap-2 ${hasImage ? "step-text font-semibold" : "text-[var(--text-muted)]"}`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${hasImage ? "step-circle-active text-white" : "step-circle-bg step-text border-2 border-[var(--sage-dark)]"}`}
            >
              1
            </span>
            <span className="text-[var(--step-text)]">Upload Image</span>
          </div>
          <div className="flex-1 h-1 bg-[var(--border)] mx-4"></div>
          <div
            className={`flex items-center gap-2 ${hasAnalysis ? "step-text font-semibold" : "text-[var(--text-muted)]"}`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${hasAnalysis ? "step-circle-active text-white" : "step-circle-bg step-text border-2 border-[var(--sage-dark)]"}`}
            >
              2
            </span>
            <span className="text-[var(--step-text)]">Analyze & Write</span>
          </div>
          <div className="flex-1 h-1 bg-[var(--border)] mx-4"></div>
          <div
            className={`flex items-center gap-2 ${tags.length > 0 ? "step-text font-semibold" : "text-[var(--text-muted)]"}`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${tags.length > 0 ? "step-circle-active text-white" : "step-circle-bg step-text border-2 border-[var(--sage-dark)]"}`}
            >
              3
            </span>
            <span className="text-[var(--step-text)]">Tag Notes</span>
          </div>
          <div className="flex-1 h-1 bg-[var(--border)] mx-4"></div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <span className="w-8 h-8 rounded-full flex items-center justify-center step-circle-bg step-text border-2 border-[var(--sage-dark)]">
              4
            </span>
            <span className="text-[var(--step-text)]">Save Note</span>
          </div>
        </div>
      </div>

      {/* Step 1: Username & Image Upload */}
      <div className="bg-[var(--card-bg)] border-2 border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--sage-dark)] mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--sage-medium)] text-white flex items-center justify-center text-sm font-bold">
            1
          </span>
          Player Info & Draft Image
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--sage-dark)] mb-2">
              Summoner Name
            </label>
            <input
              type="text"
              placeholder="Enter your summoner name"
              className="w-full border-2 border-[var(--border)] rounded-lg p-3 bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--sage-dark)] mb-2">
              Draft/Lobby Screenshot{" "}
              <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border-2 border-dashed border-[var(--sage-light)] rounded-lg p-4 bg-[var(--sage-light)]/20 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sage-medium)] focus:border-transparent transition-all cursor-pointer hover:border-[var(--sage-medium)]"
              />
            </div>
            {imageFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--sage-dark)]">
                <span className="font-medium">Selected:</span>
                <span>{imageFile.name}</span>
              </div>
            )}
          </div>

          <button
            disabled={!imageFile || loadingDraft}
            onClick={handleAnalyzeImage}
            className="w-full bg-[var(--sage-medium)] hover:bg-[var(--sage-dark)] text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loadingDraft ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing Image...
              </span>
            ) : (
              "Analyze Draft Image"
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Game Details */}
      <div
        className={`bg-[var(--card-bg)] border-2 rounded-xl p-6 shadow-sm transition-all ${hasAnalysis ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
      >
        <h2 className="text-xl font-semibold text-[var(--sage-dark)] mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--sage-medium)] text-white flex items-center justify-center text-sm font-bold">
            2
          </span>
          Game Details
        </h2>

        <div className="space-y-5">
          {/* Matchup Field */}
          <div>
            <label className="block text-sm font-medium text-[var(--sage-dark)] mb-2">
              Matchup{" "}
              <span className="text-xs text-[var(--text-muted)]">
                (Auto-filled from image analysis)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., Ahri (Mid) vs Zed"
              className="w-full border-2 border-[var(--border)] rounded-lg p-3 bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-lg"
              value={matchup}
              onChange={(e) => setMatchup(e.target.value)}
            />
          </div>

          {/* Game Outcome Selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--sage-dark)] mb-2">
              Game Outcome{" "}
              <span className="text-xs text-[var(--text-muted)]">
                (Auto-detected from image)
              </span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGameOutcome("victory")}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
                  gameOutcome === "victory"
                    ? "bg-[var(--sage-medium)] text-white border-[var(--sage-dark)] shadow-md"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--sage-medium)]"
                }`}
              >
                Victory
              </button>
              <button
                type="button"
                onClick={() => setGameOutcome("defeat")}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
                  gameOutcome === "defeat"
                    ? "bg-rose-500 text-white border-rose-600 shadow-md"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:border-rose-400"
                }`}
              >
                Defeat
              </button>
              <button
                type="button"
                onClick={() => setGameOutcome("unknown")}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
                  gameOutcome === "unknown"
                    ? "bg-gray-500 text-white border-gray-600 shadow-md"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:border-gray-400"
                }`}
              >
                Unknown
              </button>
            </div>
          </div>

          {/* What Went Well */}
          <div>
            <label className="block text-sm font-medium text-[var(--sage-dark)] mb-2 flex items-center gap-2">
              What Went Well
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (Voice input coming soon)
              </span>
            </label>
            <textarea
              placeholder="Describe the positive aspects of your gameplay...
Examples:
- Good CS in lane (80+ at 10 min)
- Successfully dodged key abilities
- Made good roam plays
- Won teamfights with good positioning"
              className="w-full border-2 border-[var(--border)] rounded-lg p-4 bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none text-base leading-relaxed"
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              rows={6}
            />
            <div className="mt-1 text-xs text-[var(--text-muted)] text-right">
              {whatWentWell.length} characters
            </div>
          </div>

          {/* What Went Poorly */}
          <div>
            <label className="block text-sm font-medium text-[var(--sage-dark)] mb-2 flex items-center gap-2">
              What Went Poorly
              <span className="text-xs text-[var(--text-muted)] font-normal">
                (Voice input coming soon)
              </span>
            </label>
            <textarea
              placeholder="Describe areas that need improvement...
Examples:
- Died too much in lane (0/3 before 10 min)
- Missed farm opportunities
- Poor map awareness - didn't see ganks
- Bad positioning in teamfights"
              className="w-full border-2 border-[var(--border)] rounded-lg p-4 bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none text-base leading-relaxed"
              value={whatWentPoorly}
              onChange={(e) => setWhatWentPoorly(e.target.value)}
              rows={6}
            />
            <div className="mt-1 text-xs text-[var(--text-muted)] text-right">
              {whatWentPoorly.length} characters
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Tags */}
      <div className="bg-[var(--card-bg)] border-2 border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--sage-dark)] mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--sage-medium)] text-white flex items-center justify-center text-sm font-bold">
            3
          </span>
          AI-Powered Tags
        </h2>

        <button
          onClick={runAutotag}
          disabled={tagging || !hasContent}
          className="w-full bg-[var(--sage-light)] text-[var(--sage-dark)] px-6 py-3 rounded-lg hover:bg-[var(--sage-medium)] hover:text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mb-4"
        >
          {tagging ? "Generating Tags..." : "Generate Smart Tags"}
        </button>

        <div className="mt-4">
          <p className="text-sm text-[var(--text-muted)] mb-2">
            Suggested tags:
          </p>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {tags.length === 0 ? (
              <span className="text-sm text-[var(--text-muted)] italic">
                Click "Generate Smart Tags" to get AI-suggested tags
              </span>
            ) : (
              tags.map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 bg-[var(--sage-light)] text-[var(--sage-dark)] rounded-full text-sm font-medium shadow-sm"
                  title={tagExplanations[t] ?? ""}
                >
                  #{t}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Step 4: Submit */}
      <div className="bg-[var(--card-bg)] border-2 border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--sage-dark)] mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--sage-medium)] text-white flex items-center justify-center text-sm font-bold">
            4
          </span>
          Review & Save
        </h2>

        <div className="bg-[var(--sage-light)]/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-[var(--sage-dark)] mb-2">
            <strong>Note Summary:</strong>
          </p>
          <ul className="text-sm text-[var(--text-muted)] space-y-1 ml-4">
            <li>Summoner: {username || "Not set"}</li>
            <li>Draft Analysis: {draftResult ? "Complete" : "Pending"}</li>
            <li>Matchup: {matchup || "Not filled"}</li>
            <li>
              Positives:{" "}
              {whatWentWell ? `${whatWentWell.length} chars` : "Not filled"}
            </li>
            <li>
              Negatives:{" "}
              {whatWentPoorly ? `${whatWentPoorly.length} chars` : "Not filled"}
            </li>
            <li>Tags: {tags.length} generated</li>
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--sage-dark)] hover:bg-[var(--sage-medium)] text-white px-6 py-4 rounded-lg transition-colors font-bold text-lg shadow-lg"
        >
          Save Game Note
        </button>
      </div>
    </div>
  );
}
