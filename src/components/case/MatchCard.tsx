import { CUSTODY_LABEL, recommendationLabel } from "@/lib/ui/labels";
import type { FoundItemPublic, MatchComparison } from "@/lib/domain/types";

export function MatchCard({
  item,
  comparison,
  busy,
  ownershipLocked,
  onCompare,
  onRequestEvidence,
}: {
  item: FoundItemPublic;
  comparison?: MatchComparison;
  busy: boolean;
  ownershipLocked: boolean;
  onCompare: () => void;
  onRequestEvidence: () => void;
}) {
  const unavailable = item.status !== "unclaimed";
  const actionable = !unavailable && !ownershipLocked;
  const goodMatch =
    comparison?.recommendation === "strong_match" ||
    comparison?.recommendation === "partial_match";

  return (
    <li className="surface-lg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[var(--ink)]">
            {item.description}
            <span className="ml-2 font-mono text-[11px] font-normal text-[var(--ink-subtle)]">
              {item.id}
            </span>
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{item.foundLocation}</p>
          <p className="mt-1 text-xs text-[var(--ink-subtle)]">
            {CUSTODY_LABEL[item.custodyDomain]} · {item.custodyOwner}
            {item.flightNumber ? ` · ${item.flightNumber}` : ""}
            {unavailable ? ` · ${item.status.replace(/_/g, " ")}` : ""}
          </p>
        </div>
        {unavailable ? (
          <span className="rounded bg-[var(--danger-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--danger)]">
            Unavailable
          </span>
        ) : comparison ? (
          <span
            className={`rounded px-2 py-1 text-[11px] font-semibold ${
              comparison.recommendation === "strong_match"
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : comparison.recommendation === "partial_match"
                  ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                  : "bg-[#eef1f4] text-[var(--ink-muted)]"
            }`}
          >
            {comparison.score}% · {recommendationLabel(comparison.recommendation)}
          </span>
        ) : null}
      </div>

      {comparison && (
        <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-xs">
          {comparison.reasons.map((r) => (
            <li key={r} className="flex items-start gap-1.5 text-[var(--success)]">
              <span className="mt-0.5 shrink-0">✓</span>
              <span>{r}</span>
            </li>
          ))}
          {comparison.rejectionReasons.map((r) => (
            <li key={r} className="flex items-start gap-1.5 text-[var(--danger)]">
              <span className="mt-0.5 shrink-0">✗</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={busy}
          className="btn btn-secondary !px-3 !py-1.5 !text-xs"
          onClick={onCompare}
        >
          {comparison ? "Re-score" : "Review match"}
        </button>
        <button
          disabled={busy || !actionable}
          className={`btn !px-3 !py-1.5 !text-xs ${
            actionable && goodMatch ? "btn-primary" : "btn-secondary"
          }`}
          onClick={onRequestEvidence}
        >
          Confirm it is yours
        </button>
      </div>
    </li>
  );
}
