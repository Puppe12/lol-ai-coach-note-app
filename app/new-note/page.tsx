"use client";

import { useState } from "react";

export default function NewNotePage() {
  const [noteText, setNoteText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Image draft related states
  const [summonerName, setSummonerName] = useState("");
  const [draftResult, setDraftResult] = useState<any>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // Tagging related state
  const [tags, setTags] = useState<string[]>([]);
  const [tagging, setTagging] = useState(false);
  const [tagExplanations, setTagExplanations] = useState<
    Record<string, string>
  >({});

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!noteText.trim()) {
      alert("Please write a note first");
      return;
    }

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: noteText,
        draft: draftResult,
        summonerName,
        tags,
      }),
    });

    if (!res.ok) {
      alert("Failed to save note");
      return;
    }

    setNoteText("");
    setImageFile(null);

    alert("Note saved!");
  };

  function generateNoteFromDraft(draft: any): string {
    if (!draft?.me) return "";

    const { champion, role, opponentChampion } = draft.me;

    let text = `Game notes:\n\n`;

    text += `Played ${champion}`;
    if (role) text += ` (${role})`;
    if (opponentChampion) text += ` vs ${opponentChampion}`;
    text += `.\n\n`;

    text += `What went well:\n- \n\n`;
    text += `What went poorly:\n- \n\n`;
    text += `Things to improve next game:\n- `;

    return text;
  }

  async function runAutotag() {
    if (!noteText.trim()) {
      alert("Write a small note first (autotag needs text).");
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
        alert("Autotag failed: " + (data?.error ?? "unknown"));
      } else {
        setTags(data.tags || []);
        setTagExplanations(data.explanations || {});
      }
    } catch (e) {
      console.error(e);
      alert("Autotag request failed");
    } finally {
      setTagging(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--sage-dark)]">
        New League Note
      </h1>

      <div>
        <textarea
          value={noteText}
          onChange={handleNoteChange}
          placeholder="Write your note here..."
          className="w-full border border-[var(--sage-light)] rounded-lg p-3 h-40 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-[var(--sage-medium)] focus:border-transparent transition-all"
        />
      </div>

      <div className="mt-3">
        <button
          onClick={runAutotag}
          disabled={tagging}
          className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg hover:bg-[var(--sage-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tagging ? "Tagging…" : "Auto-tag Note"}
        </button>

        <span className="text-sm text-[var(--text-muted)] ml-3">
          Suggested tags:
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="text-sm text-[var(--text-muted)]">none</span>
          ) : (
            tags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  // toggle tag into note text if you want; for now we just keep them selected
                  if (!noteText.includes(`#${t}`))
                    setNoteText(
                      (s) => s + (s.endsWith("\n") ? "" : "\n") + `#${t} `
                    );
                }}
                className="px-3 py-1 bg-[var(--sage-light)] text-[var(--sage-dark)] rounded-lg text-sm hover:bg-[var(--sage-medium)] hover:text-white transition-colors font-medium"
                title={tagExplanations[t] ?? ""}
              >
                #{t}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="mb-4 border border-[var(--sage-light)] rounded-lg p-4 bg-white shadow-sm">
        <label className="block mb-2 font-medium text-[var(--sage-dark)]">
          Upload Lobby Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-[var(--sage-light)] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--sage-medium)] focus:border-transparent transition-all"
        />
        {imageFile && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {imageFile.name}
          </p>
        )}
      </div>

      <input
        type="text"
        placeholder="Your summoner name"
        className="w-full border border-[var(--sage-light)] rounded-lg p-3 mb-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--sage-medium)] focus:border-transparent transition-all"
        value={summonerName}
        onChange={(e) => setSummonerName(e.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        <button
          disabled={!imageFile || !summonerName || loadingDraft}
          onClick={async () => {
            if (!imageFile) return;

            setLoadingDraft(true);
            const form = new FormData();
            form.append("image", imageFile);
            form.append("summonerName", summonerName);

            const res = await fetch("/api/draft", {
              method: "POST",
              body: form,
            });

            const data = await res.json();
            setDraftResult(data);
            setLoadingDraft(false);
          }}
          className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg hover:bg-[var(--sage-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingDraft ? "Analyzing..." : "Generate Draft from Image"}
        </button>

        <button
          onClick={handleSubmit}
          className="bg-[var(--sage-medium)] text-white px-4 py-2 rounded-lg hover:bg-[var(--sage-dark)] transition-colors font-medium"
        >
          Save Note
        </button>

        {draftResult && (
          <button
            onClick={() => {
              const generatedNote = generateNoteFromDraft(draftResult);
              setNoteText(generatedNote);
            }}
            className="bg-[var(--sage-light)] text-[var(--sage-dark)] px-4 py-2 rounded-lg hover:bg-[var(--sage-medium)] hover:text-white transition-colors font-medium"
          >
            Generate Note from Draft
          </button>
        )}
      </div>
    </div>
  );
}
