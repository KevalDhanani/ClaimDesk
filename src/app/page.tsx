import Link from "next/link";
import { recoveryService } from "@/lib/domain/recovery-service";
import {
  IconDesk,
  IconPlane,
  IconRoute,
  IconSearch,
  IconShieldCheck,
} from "@/components/Icons";
import { HeroPlanes } from "@/components/HeroPlanes";
import { ClaimsList } from "@/components/ClaimsList";

export const dynamic = "force-dynamic";

const HOME_CLAIMS_PREVIEW = 3;

const STEPS = [
  {
    title: "Match across locations",
    body: "Search items held from aircraft, terminals, and airport lost & found desks linked to your AeroOne journey.",
    Icon: IconSearch,
  },
  {
    title: "Confirm it’s yours",
    body: "Share a private identifying detail that wouldn’t appear on a public listing.",
    Icon: IconShieldCheck,
  },
  {
    title: "Collect with confidence",
    body: "Approve pickup when you’re ready, then collect with photo ID at the designated desk.",
    Icon: IconDesk,
  },
] as const;

const KEY_FACTS = [
  {
    title: "Cabin & airport",
    body: "Items left on board should be claimed via AeroOne. Terminal finds may also sit with partner airport desks.",
  },
  {
    title: "Ownership check",
    body: "Public listings omit private details. You’ll confirm a detail only the owner would know.",
  },
  {
    title: "Pickup hours",
    body: "Collection desks typically operate 08:00–20:00 IST. Bring government photo ID matching your claim.",
  },
  {
    title: "Retention",
    body: "Cabin property transferred to airport lost & found is generally held for up to 30 days.",
  },
] as const;

export default async function DashboardPage() {
  const cases = await recoveryService.listCases();
  const flights = await recoveryService.listFlights();

  return (
    <div>
      <section className="hero">
        <div className="hero-pattern" aria-hidden />
        <div className="hero-glow" aria-hidden />
        <div className="hero-fade" aria-hidden />
        <div className="shell relative z-[2] py-14 sm:py-16 lg:py-20">
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--highlight)]">
                AeroOne · Passenger assistance
              </p>
              <h1 className="mt-3 text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-white">
                Lost &amp; Found for your AeroOne journey
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/75 sm:text-base">
                Report something left behind on your flight or at a partner airport,
                match it with held inventory, confirm ownership, and arrange pickup —
                all in one official ClaimDesk case.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/report" className="btn btn-on-dark">
                  Report an item
                </Link>
                <Link href="/claims" className="btn btn-ghost">
                  View my claims
                </Link>
              </div>
            </div>
            <div className="hero-art" aria-hidden>
              <HeroPlanes />
            </div>
          </div>
        </div>
      </section>

      <section className="info-band" aria-label="Key information">
        <div className="shell grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {KEY_FACTS.map((fact) => (
            <div key={fact.title}>
              <h2 className="text-sm font-semibold text-[var(--ink)]">{fact.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
                {fact.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="band scroll-mt-24">
        <div className="shell py-12">
          <div className="max-w-2xl">
            <p className="section-title">How to find and report</p>
            <h2 className="page-title mt-2">Reporting and retrieving lost items</h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              You don’t need to know which desk is holding the item. Open a claim
              with your flight details, then search found property across cabin and
              airport custody.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ title, body, Icon }, index) => (
              <div key={title} className="surface-lg p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold text-[var(--ink-subtle)]">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div id="claims" className="scroll-mt-28 space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="section-title">Your portal</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
                Your claims
              </h2>
            </div>
            <span className="text-sm text-[var(--ink-subtle)]">
              {cases.length} open
            </span>
          </div>

          <ClaimsList cases={cases.slice(0, HOME_CLAIMS_PREVIEW)} />

          {cases.length > HOME_CLAIMS_PREVIEW ? (
            <div className="flex justify-end pt-1">
              <Link
                href="/claims"
                className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                View more →
              </Link>
            </div>
          ) : cases.length > 0 ? (
            <div className="flex justify-end pt-1">
              <Link
                href="/claims"
                className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                View all claims →
              </Link>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconPlane className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <p className="section-title">Travel</p>
              <h2 className="text-xl font-semibold text-[var(--ink)]">
                Recent AeroOne flights
              </h2>
            </div>
          </div>
          <ul className="surface-lg divide-y divide-[var(--border)] overflow-hidden">
            {flights.slice(0, 6).map((f) => (
              <li key={f.id} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-[var(--ink)]">{f.flightNumber}</span>
                  <span className="text-xs text-[var(--ink-subtle)]">{f.date}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--ink-muted)]">
                  <IconRoute className="h-3.5 w-3.5 shrink-0 text-[var(--ink-subtle)]" />
                  {f.origin} → {f.destination}
                </p>
                <p className="mt-0.5 text-xs text-[var(--ink-subtle)]">
                  Gate {f.gate} · {f.aircraft} · Terminal {f.terminal}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--ink-subtle)]">
            Claims are linked to your AeroOne booking details for faster matching.
          </p>
        </div>
      </section>
    </div>
  );
}
