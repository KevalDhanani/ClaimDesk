import type { CustodyDomain, FoundItemPublic, RecoveryCase } from "./types";

export interface MatchScoreResult {
  score: number;
  reasons: string[];
  rejectionReasons: string[];
  recommendation: "strong_match" | "partial_match" | "unlikely" | "reject";
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(text: string): Set<string> {
  return new Set(normalize(text).split(" ").filter(Boolean));
}

function overlapScore(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let hit = 0;
  for (const t of ta) {
    if (tb.has(t)) hit += 1;
  }
  return hit / Math.max(ta.size, tb.size);
}

function custodyFromLastKnown(lastKnown: string | null): CustodyDomain | null {
  if (!lastKnown) return null;
  const n = normalize(lastKnown);
  if (n.includes("aircraft") || n.includes("plane") || n.includes("seat")) {
    return "aircraft";
  }
  if (n.includes("gate") || n.includes("terminal")) return "terminal_gate";
  if (n.includes("airport") || n.includes("baggage") || n.includes("carousel")) {
    return "airport_lnf";
  }
  return null;
}

export function scoreMatch(
  recoveryCase: RecoveryCase,
  item: FoundItemPublic
): MatchScoreResult {
  const reasons: string[] = [];
  const rejectionReasons: string[] = [];
  let score = 0;

  const descOverlap = overlapScore(
    recoveryCase.itemDescription,
    `${item.description} ${item.color}`
  );
  const descPoints = Math.round(descOverlap * 25);
  score += descPoints;
  if (descPoints >= 18) {
    reasons.push(`Description closely matches (${item.description}, ${item.color})`);
  } else if (descPoints >= 10) {
    reasons.push("Partial description overlap");
  } else {
    rejectionReasons.push("Description does not align well with the reported item");
  }

  const caseFlight = recoveryCase.flightNumber.toUpperCase();
  const itemFlight = item.flightNumber?.toUpperCase() ?? null;
  if (itemFlight && itemFlight === caseFlight) {
    score += 28;
    reasons.push(`Associated with the same flight (${itemFlight})`);
  } else if (itemFlight && itemFlight !== caseFlight) {
    score -= 35;
    rejectionReasons.push(
      `Flight mismatch: item linked to ${itemFlight}, case is ${caseFlight}`
    );
  } else {
    reasons.push("No flight association on the found item");
  }

  if (item.flightDate && item.flightDate === recoveryCase.travelDate) {
    score += 12;
    reasons.push(`Found on the same travel date (${item.flightDate})`);
  } else if (item.flightDate && item.flightDate !== recoveryCase.travelDate) {
    score -= 12;
    rejectionReasons.push(
      `Date mismatch: item date ${item.flightDate} vs travel ${recoveryCase.travelDate}`
    );
  }

  const preferred = custodyFromLastKnown(recoveryCase.lastKnownLocation);

  if (item.custodyDomain === "aircraft" && itemFlight === caseFlight) {
    score += 22;
    reasons.push(
      "Held in aircraft custody for the same flight — strongest cabin recovery signal"
    );
  } else if (preferred && item.custodyDomain === preferred) {
    score += 14;
    reasons.push(`Custody domain matches last known location (${item.custodyDomain})`);
  } else if (preferred === "aircraft" && item.custodyDomain === "airport_lnf") {
    score += 2;
    reasons.push(
      "Airport custody is possible, but weaker than an aircraft find when last known location was the cabin"
    );
  } else if (preferred && item.custodyDomain !== preferred) {
    score += 4;
    reasons.push(
      `Different custody domain (${item.custodyDomain}); still possible given passenger uncertainty`
    );
  } else {
    score += 6;
    reasons.push(`Item held by ${item.custodyOwner} (${item.custodyDomain})`);
  }

  const destNorm = normalize(recoveryCase.destination);
  const locNorm = normalize(item.foundLocation);
  if (
    item.custodyDomain !== "aircraft" &&
    destNorm &&
    locNorm.includes(destNorm.split(" ")[0])
  ) {
    score += 6;
    reasons.push(`Found near destination context (${recoveryCase.destination})`);
  } else if (
    normalize(recoveryCase.origin) &&
    locNorm.includes(normalize(recoveryCase.origin).split(" ")[0]) &&
    itemFlight &&
    itemFlight !== caseFlight
  ) {
    score -= 8;
    rejectionReasons.push("Found at origin airport with mismatched flight context");
  }

  // Time proximity: aircraft finds shortly after arrival are stronger than later airport desk logs
  if (item.custodyDomain === "aircraft" && item.flightDate === recoveryCase.travelDate) {
    score += 5;
    reasons.push("Recovery timing aligns with post-flight cabin sweep");
  }

  score = Math.max(0, Math.min(100, score));

  let recommendation: MatchScoreResult["recommendation"];
  if (rejectionReasons.some((r) => r.includes("Flight mismatch")) && score < 55) {
    recommendation = "reject";
  } else if (score >= 75) {
    recommendation = "strong_match";
  } else if (score >= 55) {
    recommendation = "partial_match";
  } else if (score >= 30) {
    recommendation = "unlikely";
  } else {
    recommendation = "reject";
  }

  return { score, reasons, rejectionReasons, recommendation };
}
