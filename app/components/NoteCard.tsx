import { parseNoteText } from "../utils/noteParser";

type DraftData = {
  champion?: string;
  role?: string;
  opponentChampion?: string;
  me?: {
    champion?: string;
    role?: string;
    opponentChampion?: string;
  };
};

type Note = {
  _id: string;
  text: string;
  createdAt?: string | Date;
  draft?: DraftData;
  summonerName?: string;
  ai?: {
    tags?: string[];
    embedding?: number[];
  };
};

type NoteCardProps = {
  note: Note;
};

export default function NoteCard({ note }: NoteCardProps) {
  const parsed = parseNoteText(note.text);

  // Get draft info - prefer draft.me, fallback to draft directly
  const draftInfo = note.draft?.me || note.draft;
  const champion = draftInfo?.champion;
  const role = draftInfo?.role;
  const opponentChampion = draftInfo?.opponentChampion;

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

  // Use draft data if available, otherwise use parsed matchup
  const displayMatchup = champion
    ? `${champion}${role ? ` (${role})` : ""}${
        opponentChampion ? ` vs ${opponentChampion}` : ""
      }`
    : parsed.matchup;

  return (
    <div className="bg-[var(--card-bg)] border-2 border-[var(--border)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-[var(--border)]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {formattedDate}
            </p>
            {note.summonerName && (
              <>
                <span className="text-[var(--text-muted)]">•</span>
                <p className="text-sm font-medium text-[var(--sage-dark)]">
                  {note.summonerName}
                </p>
              </>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[var(--sage-light)] text-[var(--sage-dark)] rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Matchup Section */}
      {displayMatchup && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--sage-dark)] mb-2 uppercase tracking-wide">
            Matchup
          </h3>
          <div className="bg-[var(--sage-light)]/30 rounded-lg p-3">
            <p className="text-base font-medium text-[var(--foreground)]">
              {displayMatchup}
            </p>
            {champion && (
              <div className="mt-2 text-xs text-[var(--text-muted)]">
                {role && <span>Role: {role}</span>}
                {opponentChampion && (
                  <>
                    {role && <span> • </span>}
                    <span>Opponent: {opponentChampion}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* What Went Well */}
      {parsed.whatWentWell && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--sage-dark)] mb-2 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-green-500"></span>
            What Went Well
          </h3>
          <div className="bg-emerald-50/50 dark:bg-green-900/20 border border-emerald-200/60 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {parsed.whatWentWell}
            </p>
          </div>
        </div>
      )}

      {/* What Went Poorly */}
      {parsed.whatWentPoorly && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--sage-dark)] mb-2 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 dark:bg-red-500"></span>
            What Went Poorly
          </h3>
          <div className="bg-rose-50/50 dark:bg-red-900/20 border border-rose-200/60 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {parsed.whatWentPoorly}
            </p>
          </div>
        </div>
      )}

      {/* Fallback: If no structured sections found, show full text */}
      {!parsed.whatWentWell && !parsed.whatWentPoorly && parsed.matchup && (
        <div className="mt-2">
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
            {note.text}
          </p>
        </div>
      )}
    </div>
  );
}
