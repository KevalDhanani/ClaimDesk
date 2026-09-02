import Link from "next/link";
import { recoveryService } from "@/lib/domain/recovery-service";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cases = await recoveryService.listCases();
  const flights = await recoveryService.listFlights();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-8 py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, #e8f0f8 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, #f0ebe3 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-2xl space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            AeroOne × ClaimDesk
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            ClaimDesk
          </h1>
          <p className="text-lg text-[var(--ink-muted)]">
            Lost after your flight. Matched, proven, ready for pickup.
          </p>
          <p className="max-w-xl text-[var(--ink-muted)]">
            Recovery investigations across aircraft and airport custody — with
            ownership verification and human authorization for final recovery.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/report"
              className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
            >
              Report lost item
            </Link>
            <span className="self-center text-xs text-[var(--ink-muted)]">
              Data: Firestore · Demo passenger session
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold">Active recovery cases</h2>
            <span className="text-sm text-[var(--ink-muted)]">{cases.length} open</span>
          </div>
          {cases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-10 text-[var(--ink-muted)]">
              No investigations yet. Report a lost item to open a recovery case —
              or ask an agent to investigate while this page is open.
            </div>
          ) : (
            <ul className="space-y-3">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}`}
                    className="block rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 transition hover:border-[var(--accent)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--ink)]">{c.itemDescription}</p>
                        <p className="mt-1 text-sm text-[var(--ink-muted)]">
                          {c.flightNumber} · {c.origin} → {c.destination} · {c.travelDate}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-3 text-xs text-[var(--ink-muted)]">{c.id}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent AeroOne flights</h2>
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
            {flights.slice(0, 6).map((f) => (
              <li key={f.id} className="px-5 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{f.flightNumber}</span>
                  <span className="text-xs text-[var(--ink-muted)]">{f.date}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {f.origin} → {f.destination} · Gate {f.gate} · {f.aircraft}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
            Demo tip: lost black backpack on <strong>AO-123</strong> (1 Sep 2026),
            uncertain aircraft vs airport. Private evidence for the strong match is a
            small red keychain.
          </p>
        </div>
      </section>
    </div>
  );
}
