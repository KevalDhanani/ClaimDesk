import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--navy-950)] text-white">
      <div className="shell grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          {/* Logo mark + wordmark */}
          <div className="flex items-center gap-3">
            <span className="logo-badge flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] font-extrabold leading-none tracking-tighter text-[var(--navy-900)]">
              AO
            </span>
            <div>
              <p className="text-[15px] leading-tight tracking-tight">
                <span className="font-light opacity-75">Claim</span><span className="font-bold">Desk</span>
              </p>
              <p className="text-[10px] font-medium tracking-[0.1em] text-white/40">AEROONE LOST PROPERTY</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            The official lost property portal for AeroOne passengers.
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
                <Link href="/claims" className="hover:text-white">
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
        <div className="shell py-4 text-[11px] text-white/45">
          <p>© {new Date().getFullYear()} AeroOne Airlines. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
