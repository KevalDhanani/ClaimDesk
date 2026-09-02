import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--navy-950)] text-white">
      <div className="shell grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-lg font-semibold tracking-tight">AeroOne</p>
          <p className="mt-1 text-sm text-white/65">Connecting India and beyond</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            ClaimDesk is the official lost property portal for AeroOne passengers.
            Items found on board or at partner airport desks are matched to your
            claim, confirmed with ownership details, and released for pickup.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
              Passenger
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>
                <Link href="/report" className="hover:text-white">
                  Report an item
                </Link>
              </li>
              <li>
                <Link href="/#claims" className="hover:text-white">
                  My claims
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white">
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
              Collection
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>Photo ID required</li>
              <li>Partner airport desks</li>
              <li>Cabin transfers held 30 days</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-4 text-[11px] text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} AeroOne Airlines. All rights reserved.</p>
          <p>Official passenger lost property service</p>
        </div>
      </div>
    </footer>
  );
}
