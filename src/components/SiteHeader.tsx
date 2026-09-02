import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy-950)] text-white">
      <div className="shell flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white text-xs font-bold tracking-tight text-[var(--navy-900)]">
            AO
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-tight">
              ClaimDesk
            </span>
            <span className="block text-[11px] text-white/65">
              AeroOne Lost Property
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Home
          </Link>
          <Link
            href="/#claims"
            className="hidden rounded px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            My claims
          </Link>
          <Link href="/report" className="btn btn-on-dark !px-4 !py-2">
            Report an item
          </Link>
        </nav>
      </div>
    </header>
  );
}
