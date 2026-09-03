import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { IconLuggage } from "@/components/Icons";
import type { RecoveryCase } from "@/lib/domain/types";

export function ClaimsList({
  cases,
  emptyActionHref = "/report",
}: {
  cases: RecoveryCase[];
  emptyActionHref?: string;
}) {
  if (cases.length === 0) {
    return (
      <div className="surface-lg flex flex-col items-start gap-5 px-6 py-10 sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <IconLuggage className="h-9 w-9" title="Luggage" />
        </span>
        <div>
          <p className="text-lg font-semibold text-[var(--ink)]">No open claims</p>
          <p className="mt-2 max-w-md text-sm text-[var(--ink-muted)]">
            If you left something on an AeroOne flight or in a partner terminal,
            report it here. After you submit, open the claim to search found items
            and confirm a match.
          </p>
          <Link href={emptyActionHref} className="btn btn-primary mt-5">
            Report an item
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {cases.map((c) => (
        <li key={c.id}>
          <Link
            href={`/cases/${c.id}`}
            className="surface-lg block px-5 py-4 transition hover:border-[var(--accent-bright)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-semibold capitalize text-[var(--ink)]">
                    {c.itemDescription}
                  </p>
                  <span className="font-mono text-[10px] text-[var(--ink-subtle)]">
                    {c.id}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {c.flightNumber} · {c.origin} → {c.destination} · {c.travelDate}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
