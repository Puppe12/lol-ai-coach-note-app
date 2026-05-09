import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span>Early access • Solo queue improvement companion</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--foreground)]">
            Turn every game into{" "}
            <span className="text-[var(--primary)]">real improvement</span>.
          </h1>
          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[var(--text-muted)]">
            LoL Coach helps you capture structured notes after each match, get
            AI-assisted insights, and stay focused on the habits that actually
            make you climb—without needing spreadsheets or VOD folders.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="/new-note"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-dark)]"
            >
              Create a note
            </Link>
            <Link
              href="/notes"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-6 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--secondary)]"
            >
              View your notes
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            No email required. Please avoid sharing personal information (real
            names, emails, etc.) while auth is still basic.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-1 justify-center lg:mt-0 lg:justify-end">
        <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--foreground)]">
              Example post‑game note
            </span>
            <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] uppercase tracking-wide">
              AI summary
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--foreground)]">
                Matchup
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-green-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                Top • Camille vs Jax
              </span>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold text-[var(--foreground)]">
                What went well
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Tracked Jax E cooldowns and held hookshot, kept wave on my side
                for first three waves and called my jungler on stacked wave.
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold text-[var(--foreground)]">
                To improve
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Turbo‑int last two fights by engaging before my team had vision
                setup. Next games: only flank when we see enemy jungler or have
                mid prio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

