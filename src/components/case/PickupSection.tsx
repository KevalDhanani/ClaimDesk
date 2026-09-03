import type { RecoveryCase } from "@/lib/domain/types";

export function PickupSection({
  recoveryCase,
  busy,
  onPrepare,
  onAuthorize,
}: {
  recoveryCase: RecoveryCase;
  busy: boolean;
  onPrepare: () => void;
  onAuthorize: () => void;
}) {
  const packet = recoveryCase.recoveryPacket;
  const locked = Boolean(recoveryCase.ownershipLocked);

  return (
    <section className="surface-lg p-5">
      <h2 className="text-base font-semibold">Pickup details</h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        After ownership is confirmed, prepare pickup instructions. You must
        approve before the item is released.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={busy || !recoveryCase.ownershipVerified || locked}
          className="btn btn-secondary"
          onClick={onPrepare}
        >
          Prepare pickup
        </button>
        <button
          disabled={busy || !recoveryCase.recoveryPrepared || locked}
          className="btn btn-success"
          onClick={onAuthorize}
        >
          Confirm pickup
        </button>
      </div>

      {packet && (
        <div className="mt-5 space-y-2 rounded border border-[var(--border)] bg-[var(--bg)] p-4 text-sm">
          <p className="font-semibold text-[var(--ink)]">Pickup summary</p>
          <p>{packet.itemSummary}</p>
          <p className="text-[var(--ink-muted)]">Location: {packet.pickupLocation}</p>
          <p className="text-[var(--ink-muted)]">Hours: {packet.pickupHours}</p>
          <p className="text-[var(--ink-muted)]">Held by: {packet.custodyOwner}</p>
          <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
            {packet.instructions.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      )}

      {recoveryCase.status === "ready_for_collection" && (
        <p className="mt-4 rounded bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
          Ready for pickup
          {packet ? ` at ${packet.pickupLocation}` : ""}
        </p>
      )}
    </section>
  );
}
