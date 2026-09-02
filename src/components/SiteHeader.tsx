import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            ClaimDesk
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">
            AeroOne Lost Property
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Dashboard
          </Link>
          <Link
            href="/report"
            className="rounded-md bg-[var(--accent)] px-3.5 py-2 font-medium text-white hover:opacity-95"
          >
            Report lost item
          </Link>
        </nav>
      </div>
    </header>
  );
}
