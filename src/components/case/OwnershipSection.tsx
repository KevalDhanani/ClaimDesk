import { MAX_OWNERSHIP_ATTEMPTS } from "@/lib/domain/investigation";
import type { FoundItemPublic, RecoveryCase } from "@/lib/domain/types";

export function OwnershipSection({
  recoveryCase,
  selectedItem,
  evidence,
  onEvidenceChange,
  challengePrompt,
  verifyMessage,
  busy,
  onVerify,
}: {
  recoveryCase: RecoveryCase;
  selectedItem: FoundItemPublic | null;
  evidence: string;
  onEvidenceChange: (value: string) => void;
  challengePrompt: string | null;
  verifyMessage: string | null;
  busy: boolean;
  onVerify: () => void;
}) {
  const locked = Boolean(recoveryCase.ownershipLocked);
  const fails = recoveryCase.ownershipFailCount ?? 0;

  return (
    <section className="surface-lg p-5">
      <h2 className="text-base font-semibold">Confirm it's yours</h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Public listings don't show private details. Share something only the owner
        would know so we can confirm the match.
      </p>
      {locked && (
        <p className="mt-3 rounded bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          Ownership checks are paused after {MAX_OWNERSHIP_ATTEMPTS} unsuccessful
          attempts. This claim is flagged for manual review — pickup won't be
          authorized from this check.
        </p>
      )}
      {challengePrompt && !locked && (
        <p className="mt-3 rounded bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
          {challengePrompt}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="field flex-1"
          placeholder="e.g. small red keychain inside"
          value={evidence}
          onChange={(e) => onEvidenceChange(e.target.value)}
          disabled={locked}
        />
        <button
          disabled={busy || !recoveryCase.selectedFoundItemId || locked}
          className="btn btn-primary"
          onClick={onVerify}
        >
          Submit confirmation
        </button>
      </div>
      {!recoveryCase.ownershipVerified && fails > 0 && !locked && (
        <p className="mt-3 text-xs text-[var(--ink-subtle)]">
          {fails} unsuccessful attempt{fails === 1 ? "" : "s"} ·{" "}
          {Math.max(0, MAX_OWNERSHIP_ATTEMPTS - fails)} remaining
        </p>
      )}
      {verifyMessage && (
        <p
          className={`mt-3 text-sm font-medium ${
            recoveryCase.ownershipVerified
              ? "text-[var(--success)]"
              : "text-[var(--warning)]"
          }`}
        >
          {verifyMessage}
        </p>
      )}
      {!verifyMessage && recoveryCase.ownershipVerified && (
        <p className="mt-3 text-sm font-medium text-[var(--success)]">
          Ownership confirmed
          {selectedItem ? ` for ${selectedItem.description}` : ""}.
        </p>
      )}
    </section>
  );
}
