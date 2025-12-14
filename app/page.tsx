import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
          className="opacity-60"
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-[var(--sage-dark)]">
            Welcome to LoL Coach
          </h1>
          <p className="max-w-md text-lg leading-8 text-[var(--text-muted)]">
            Track your League of Legends progress with notes and insights.{" "}
            <a
              href="/notes"
              className="font-medium text-[var(--sage-dark)] hover:text-[var(--sage-medium)] transition-colors"
            >
              View your notes
            </a>{" "}
            or{" "}
            <a
              href="/new-note"
              className="font-medium text-[var(--sage-dark)] hover:text-[var(--sage-medium)] transition-colors"
            >
              create a new one
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--sage-medium)] px-5 text-white transition-colors hover:bg-[var(--sage-dark)] md:w-[158px] shadow-sm"
            href="/new-note"
          >
            New Note
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-lg border border-[var(--sage-light)] px-5 transition-colors hover:bg-[var(--sage-light)] hover:border-[var(--sage-medium)] md:w-[158px] text-[var(--sage-dark)]"
            href="/notes"
          >
            View Notes
          </a>
        </div>
      </main>
    </div>
  );
}
