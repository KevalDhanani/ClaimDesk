import type { Activity, FoundItemPublic, RecoveryCase } from "./types";

export const MAX_OWNERSHIP_ATTEMPTS = 3;

export function isRecoverableItem(item: Pick<FoundItemPublic, "status">): boolean {
  return item.status === "unclaimed";
}

export function unavailableReason(status: FoundItemPublic["status"]): string {
  if (status === "claimed") {
    return "This item has already been claimed and is not available for recovery.";
  }
  if (status === "in_transit") {
    return "This item is in transit or otherwise unavailable for recovery right now.";
  }
  return "This item is not available for recovery.";
}

export type InvestigationStepState = "done" | "current" | "pending" | "blocked";

export interface InvestigationStep {
  id: string;
  label: string;
  state: InvestigationStepState;
}

export function buildInvestigationSteps(
  recoveryCase: RecoveryCase,
  activities: Activity[]
): InvestigationStep[] {
  const types = new Set(activities.map((a) => a.type));
  const searched = types.has("search_performed");
  const compared = types.has("match_compared") || recoveryCase.comparisons.length > 0;
  const evidenceAsked =
    types.has("evidence_requested") ||
    recoveryCase.status === "ownership_pending" ||
    recoveryCase.ownershipVerified;
  const failCount = recoveryCase.ownershipFailCount ?? 0;
  const locked = Boolean(recoveryCase.ownershipLocked);

  const steps: InvestigationStep[] = [
    {
      id: "created",
      label: "Claim opened",
      state: "done",
    },
    {
      id: "flight",
      label: `Flight ${recoveryCase.flightNumber} on file`,
      state: types.has("flight_looked_up") ? "done" : "done",
    },
    {
      id: "search",
      label: searched
        ? recoveryCase.candidateIds.length > 0
          ? "Found-property inventory searched"
          : "Inventory searched — no match yet (claim kept open)"
        : "Search found-property inventory",
      state: searched ? "done" : "current",
    },
    {
      id: "candidates",
      label:
        recoveryCase.candidateIds.length > 0
          ? `${recoveryCase.candidateIds.length} candidate(s) identified`
          : "Awaiting matching candidates",
      state:
        recoveryCase.candidateIds.length > 0
          ? "done"
          : searched
            ? "current"
            : "pending",
    },
    {
      id: "compare",
      label: compared ? "Candidates reviewed" : "Review possible matches",
      state: compared
        ? "done"
        : recoveryCase.candidateIds.length > 0
          ? "current"
          : "pending",
    },
    {
      id: "evidence",
      label: locked
        ? "Ownership check paused for review"
        : recoveryCase.ownershipVerified
          ? "Ownership verified"
          : evidenceAsked
            ? failCount > 0
              ? `Ownership check in progress (${failCount} unsuccessful attempt${failCount === 1 ? "" : "s"})`
              : "Awaiting ownership detail"
            : "Confirm ownership with a private detail",
      state: locked
        ? "blocked"
        : recoveryCase.ownershipVerified
          ? "done"
          : evidenceAsked || compared
            ? "current"
            : "pending",
    },
    {
      id: "prepare",
      label: recoveryCase.recoveryPrepared
        ? "Pickup details prepared"
        : "Prepare pickup details",
      state: recoveryCase.recoveryPrepared
        ? "done"
        : recoveryCase.ownershipVerified
          ? "current"
          : "pending",
    },
    {
      id: "authorize",
      label:
        recoveryCase.status === "ready_for_collection" ||
        recoveryCase.recoveryAuthorized
          ? "Pickup confirmed — ready for collection"
          : "Awaiting your pickup confirmation",
      state:
        recoveryCase.status === "ready_for_collection" ||
        recoveryCase.recoveryAuthorized
          ? "done"
          : recoveryCase.recoveryPrepared
            ? "current"
            : "pending",
    },
  ];

  return steps;
}
