import type { CaseStatus } from "@/lib/domain/types";

const LABELS: Record<CaseStatus, string> = {
  draft: "Draft",
  investigating: "In progress",
  candidates_found: "Matches found",
  ownership_pending: "Confirm ownership",
  ownership_verified: "Ownership confirmed",
  recovery_prepared: "Pickup ready",
  recovery_authorized: "Approved",
  ready_for_collection: "Ready for pickup",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  const tone =
    status === "ready_for_collection" || status === "recovery_authorized"
      ? "bg-[var(--success-soft)] text-[var(--success)]"
      : status === "ownership_pending"
        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
        : status === "ownership_verified" || status === "recovery_prepared"
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "bg-[#eef1f4] text-[var(--ink-muted)]";

  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide ${tone}`}
    >
      {LABELS[status]}
    </span>
  );
}

export function statusLabel(status: CaseStatus): string {
  return LABELS[status];
}
