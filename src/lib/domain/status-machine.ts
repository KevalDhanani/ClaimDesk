import type { CaseStatus } from "./types";
import { STATUS_ORDER } from "./types";

const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  draft: ["investigating"],
  investigating: ["candidates_found", "investigating"],
  candidates_found: ["ownership_pending", "candidates_found", "investigating"],
  ownership_pending: [
    "ownership_verified",
    "ownership_pending",
    "candidates_found",
  ],
  ownership_verified: ["recovery_prepared", "ownership_verified"],
  recovery_prepared: ["recovery_authorized", "recovery_prepared"],
  recovery_authorized: ["ready_for_collection"],
  ready_for_collection: [],
};

export function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: CaseStatus, to: CaseStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal status transition: ${from} → ${to}`);
  }
}

export function statusIndex(status: CaseStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export function advanceAtLeast(
  current: CaseStatus,
  target: CaseStatus
): CaseStatus {
  if (statusIndex(target) >= statusIndex(current)) {
    assertTransition(current, target);
    return target;
  }
  return current;
}
