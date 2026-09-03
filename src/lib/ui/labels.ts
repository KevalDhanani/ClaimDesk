import type { Activity, CustodyDomain } from "@/lib/domain/types";

export const CUSTODY_LABEL: Record<CustodyDomain, string> = {
  aircraft: "Aircraft",
  airport_lnf: "Airport lost & found",
  terminal_gate: "Terminal / gate",
};

export function actorLabel(actor: Activity["actor"]): string {
  if (actor === "human") return "You";
  if (actor === "agent") return "ClaimDesk";
  return "System";
}

export function recommendationLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
