import type { Activity } from "@/lib/domain/types";

export function actorLabel(actor: Activity["actor"]): string {
  if (actor === "human") return "You";
  if (actor === "agent") return "ClaimDesk";
  return "System";
}

export function recommendationLabel(value: string): string {
  return value.replace(/_/g, " ");
}
