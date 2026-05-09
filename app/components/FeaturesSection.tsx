export default function FeaturesSection() {
  return (
    <section className="space-y-6 border-t border-[var(--border)] pt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">
          Built for serious solo‑queue grinders
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          A simple workflow that fits right after each game.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            1. Capture
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            Quick structured notes
          </h3>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Record matchup, lane state, key mistakes, and what actually won or
            lost the game in under two minutes.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            2. Understand
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            AI‑assisted insights
          </h3>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Let the AI highlight recurring patterns, macro leaks, and habits
            that hold you back over many games.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            3. Apply
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            Goals & review sessions
          </h3>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Turn insights into clear goals, then filter your notes to prepare
            focused review blocks before your next climb session.
          </p>
        </div>
      </div>
    </section>
  );
}

