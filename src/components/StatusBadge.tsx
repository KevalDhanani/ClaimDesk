import type { CaseStatus } from "@/lib/domain/types";

const LABELS: Record<CaseStatus, string> = {
  draft: "Draft",
  investigating: "Investigating",
  candidates_found: "Candidates found",
  ownership_pending: "Ownership pending",
  ownership_verified: "Ownership verified",
  recovery_prepared: "Recovery prepared",
  recovery_authorized: "Authorized",
  ready_for_collection: "Ready for collection",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  const tone =
    status === "ready_for_collection" || status === "recovery_authorized"
      ? "bg-[var(--success-soft)] text-[var(--success)]"
      : status === "ownership_pending"
        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
        : status.includes("verified") || status === "recovery_prepared"
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "bg-[var(--bg)] text-[var(--ink-muted)] border border-[var(--border)]";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {LABELS[status]}
    </span>
  );
}
