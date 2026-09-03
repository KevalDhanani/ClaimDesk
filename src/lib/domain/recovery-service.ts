import { evidenceMatches, ownershipChallengePrompt } from "./evidence";
import {
  buildInvestigationSteps,
  isRecoverableItem,
  MAX_OWNERSHIP_ATTEMPTS,
  unavailableReason,
} from "./investigation";
import { scoreMatch } from "./match-scoring";
import { assertTransition } from "./status-machine";
import type {
  Activity,
  CaseActionInput,
  CompareMatchInput,
  CreateCaseInput,
  Flight,
  FoundItemPublic,
  MatchComparison,
  RecoveryCase,
  RecoveryPacket,
  SearchFoundItemsInput,
  VerifyOwnershipInput,
} from "./types";
import { DEMO_PASSENGER_ID } from "./types";
import { getReadyStore } from "@/lib/data";
import { generateId } from "@/lib/data/store";

function nowIso(): string {
  return new Date().toISOString();
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function stripItem(item: FoundItemPublic): FoundItemPublic {
  return {
    id: item.id,
    description: item.description,
    brand: item.brand,
    color: item.color,
    foundLocation: item.foundLocation,
    foundAt: item.foundAt,
    flightNumber: item.flightNumber,
    flightDate: item.flightDate,
    status: item.status,
    custodyDomain: item.custodyDomain,
    custodyOwner: item.custodyOwner,
  };
}

async function logActivity(
  recoveryCaseId: string,
  type: Activity["type"],
  message: string,
  actor: Activity["actor"],
  meta?: Record<string, unknown>
): Promise<Activity> {
  const store = await getReadyStore();
  return store.addActivity({
    id: generateId("ACT"),
    recoveryCaseId,
    type,
    message,
    meta,
    timestamp: nowIso(),
    actor,
  });
}

export class RecoveryService {
  async listFlights(): Promise<Flight[]> {
    const store = await getReadyStore();
    return store.listFlights();
  }

  async listCases(passengerId = DEMO_PASSENGER_ID): Promise<RecoveryCase[]> {
    const store = await getReadyStore();
    return store.listCases(passengerId);
  }

  async getCase(recoveryCaseId: string): Promise<RecoveryCase> {
    const store = await getReadyStore();
    const recoveryCase = await store.getCase(recoveryCaseId);
    if (!recoveryCase) throw new Error(`Recovery case not found: ${recoveryCaseId}`);
    return recoveryCase;
  }

  async getActivities(recoveryCaseId: string): Promise<Activity[]> {
    const store = await getReadyStore();
    return store.listActivities(recoveryCaseId);
  }

  async getCaseBundle(recoveryCaseId: string) {
    const store = await getReadyStore();
    const recoveryCase = await this.getCase(recoveryCaseId);
    const activities = await store.listActivities(recoveryCaseId);
    const candidates = (
      await Promise.all(
        recoveryCase.candidateIds.map((id) => store.getFoundItem(id))
      )
    )
      .filter(Boolean)
      .map((i) => stripItem(i!));

    let selectedItem: FoundItemPublic | null = null;
    if (recoveryCase.selectedFoundItemId) {
      const item = await store.getFoundItem(recoveryCase.selectedFoundItemId);
      selectedItem = item ? stripItem(item) : null;
    }

    return {
      recoveryCase,
      activities,
      candidates,
      selectedItem,
      investigationSteps: buildInvestigationSteps(recoveryCase, activities),
    };
  }

  async createRecoveryCase(input: CreateCaseInput): Promise<RecoveryCase> {
    const store = await getReadyStore();
    const actor = input.actor ?? "human";
    const timestamp = nowIso();
    const flightNumber = input.flightNumber.toUpperCase();
    const knownFlight = await store.getFlightByNumber(flightNumber, input.travelDate);

    const recoveryCase: RecoveryCase = {
      id: generateId("RC"),
      passengerId: DEMO_PASSENGER_ID,
      flightNumber,
      travelDate: input.travelDate,
      origin: input.origin,
      destination: input.destination,
      itemDescription: input.itemDescription,
      lastKnownLocation: input.lastKnownLocation ?? null,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      status: "investigating",
      candidateIds: [],
      comparisons: [],
      selectedFoundItemId: null,
      ownershipVerified: false,
      recoveryPrepared: false,
      recoveryAuthorized: false,
      recoveryPacket: null,
      ownershipFailCount: 0,
      ownershipLocked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await store.saveCase(recoveryCase);
    await logActivity(
      recoveryCase.id,
      "case_created",
      `Claim opened for “${input.itemDescription}” on ${recoveryCase.flightNumber}.`,
      actor,
      {
        flightNumber: recoveryCase.flightNumber,
        travelDate: recoveryCase.travelDate,
      }
    );

    if (knownFlight) {
      await logActivity(
        recoveryCase.id,
        "flight_looked_up",
        `Confirmed flight ${knownFlight.flightNumber} ${knownFlight.origin} → ${knownFlight.destination} on ${knownFlight.date}.`,
        actor,
        { flightId: knownFlight.id }
      );
    } else {
      await logActivity(
        recoveryCase.id,
        "note",
        `Flight ${flightNumber} on ${input.travelDate} was not found in the current schedule. Claim kept open — confirm the flight number or route if needed.`,
        actor,
        { flightNumber, travelDate: input.travelDate, flightConfirmed: false }
      );
    }

    return recoveryCase;
  }

  async getFlightDetails(
    flightNumber: string,
    date?: string,
    recoveryCaseId?: string,
    actor: Activity["actor"] = "agent"
  ) {
    const store = await getReadyStore();
    const flight = await store.getFlightByNumber(flightNumber, date);
    if (!flight) {
      throw new Error(`Flight not found: ${flightNumber}`);
    }
    if (recoveryCaseId) {
      await logActivity(
        recoveryCaseId,
        "flight_looked_up",
        `Reviewed flight ${flight.flightNumber} ${flight.origin} → ${flight.destination} on ${flight.date}.`,
        actor,
        { flightId: flight.id }
      );
    }
    return flight;
  }

  async searchFoundItems(input: SearchFoundItemsInput) {
    const store = await getReadyStore();
    const actor = input.actor ?? "agent";
    const all = await store.listFoundItems();
    const desc = normalize(input.description);

    let results = all.filter((item) => {
      const hay = normalize(
        `${item.description} ${item.color} ${item.brand ?? ""} ${item.foundLocation}`
      );
      const descTokens = desc.split(" ").filter(Boolean);
      const descHit =
        descTokens.length === 0 ||
        descTokens.some((t) => hay.includes(t)) ||
        hay.includes(desc);
      return descHit;
    });

    if (input.custodyDomain) {
      results = results.filter((i) => i.custodyDomain === input.custodyDomain);
    }

    const unavailableHits = results.filter((i) => !isRecoverableItem(i));
    results = results.filter((i) => isRecoverableItem(i));

    if (input.flightNumber) {
      const fn = input.flightNumber.toUpperCase();
      results = results
        .map((item) => ({
          item,
          boost: item.flightNumber?.toUpperCase() === fn ? 2 : 0,
        }))
        .sort((a, b) => b.boost - a.boost)
        .map((x) => x.item);
    }

    if (input.location) {
      const loc = normalize(input.location);
      results = [...results].sort((a, b) => {
        const aHit =
          normalize(a.foundLocation).includes(loc) ||
          a.custodyDomain.includes(loc as never)
            ? 1
            : 0;
        const bHit =
          normalize(b.foundLocation).includes(loc) ||
          b.custodyDomain.includes(loc as never)
            ? 1
            : 0;
        return bHit - aHit;
      });
    }

    const limited = results.slice(0, 12).map(stripItem);
    let caseMessage: string | null = null;

    if (input.recoveryCaseId) {
      const recoveryCase = await this.getCase(input.recoveryCaseId);
      const merged = Array.from(
        new Set([...recoveryCase.candidateIds, ...limited.map((i) => i.id)])
      );
      recoveryCase.candidateIds = merged;

      if (limited.length > 0) {
        if (recoveryCase.status === "investigating" || recoveryCase.status === "draft") {
          assertTransition(recoveryCase.status, "candidates_found");
          recoveryCase.status = "candidates_found";
        }
        caseMessage = `Searched found items for “${input.description}”${
          input.custodyDomain ? ` (${input.custodyDomain})` : ""
        }. ${limited.length} available match(es) found.`;
      } else {
        caseMessage =
          `No matching available items currently registered for “${input.description}”. ` +
          `That doesn’t necessarily mean it hasn’t been found — newly recovered items may not be entered yet. ` +
          `Claim kept open so you can search again later.`;
        if (unavailableHits.length > 0) {
          caseMessage += ` (${unavailableHits.length} similar record(s) were already claimed or unavailable.)`;
        }
      }

      recoveryCase.updatedAt = nowIso();
      await store.saveCase(recoveryCase);
      await logActivity(recoveryCase.id, "search_performed", caseMessage, actor, {
        resultIds: limited.map((i) => i.id),
        resultCount: limited.length,
        unavailableCount: unavailableHits.length,
        custodyDomain: input.custodyDomain ?? "all",
        monitoring: limited.length === 0,
      });
    }

    return {
      results: limited.map((item) => ({
        foundItemId: item.id,
        description: item.description,
        color: item.color,
        brand: item.brand,
        foundLocation: item.foundLocation,
        foundAt: item.foundAt,
        flightNumber: item.flightNumber,
        flightDate: item.flightDate,
        custodyDomain: item.custodyDomain,
        custodyOwner: item.custodyOwner,
        status: item.status,
        matchContext:
          input.flightNumber &&
          item.flightNumber &&
          item.flightNumber.toUpperCase() !== input.flightNumber.toUpperCase()
            ? "flight mismatch"
            : item.custodyDomain,
      })),
      resultCount: limited.length,
      unavailableSkipped: unavailableHits.length,
      monitoring: limited.length === 0,
      message:
        caseMessage ??
        (limited.length === 0
          ? "No matching available items in current inventory. Newly recovered items may not be entered yet."
          : `${limited.length} available match(es) found.`),
    };
  }

  async getItemDetails(
    foundItemId: string,
    recoveryCaseId?: string,
    actor: Activity["actor"] = "agent"
  ) {
    const store = await getReadyStore();
    const item = await store.getFoundItem(foundItemId);
    if (!item) throw new Error(`Found item not found: ${foundItemId}`);
    if (recoveryCaseId) {
      await logActivity(
        recoveryCaseId,
        "item_inspected",
        `Viewed details for ${item.description} (${item.id}), held by ${item.custodyOwner}.`,
        actor,
        {
          foundItemId: item.id,
          custodyDomain: item.custodyDomain,
          status: item.status,
        }
      );
    }
    return {
      ...stripItem(item),
      recoverable: isRecoverableItem(item),
      unavailableReason: isRecoverableItem(item)
        ? null
        : unavailableReason(item.status),
    };
  }

  async comparePossibleMatch(input: CompareMatchInput) {
    const store = await getReadyStore();
    const actor = input.actor ?? "agent";
    const recoveryCase = await this.getCase(input.recoveryCaseId);
    const item = await store.getFoundItem(input.foundItemId);
    if (!item) throw new Error(`Found item not found: ${input.foundItemId}`);

    let scored = scoreMatch(recoveryCase, item);
    if (!isRecoverableItem(item)) {
      const reason = unavailableReason(item.status);
      scored = {
        score: 0,
        reasons: [],
        rejectionReasons: [reason, ...scored.rejectionReasons],
        recommendation: "reject",
      };
    }

    const comparison: MatchComparison = {
      foundItemId: item.id,
      score: scored.score,
      reasons: scored.reasons,
      rejectionReasons: scored.rejectionReasons,
      recommendation: scored.recommendation,
      comparedAt: nowIso(),
    };

    recoveryCase.comparisons = [
      ...recoveryCase.comparisons.filter((c) => c.foundItemId !== item.id),
      comparison,
    ];
    if (!recoveryCase.candidateIds.includes(item.id)) {
      recoveryCase.candidateIds.push(item.id);
    }

    const previous = recoveryCase.comparisons.find(
      (c) => c.foundItemId === recoveryCase.selectedFoundItemId
    );
    if (
      scored.recommendation === "strong_match" &&
      (!previous || scored.score >= previous.score)
    ) {
      recoveryCase.selectedFoundItemId = item.id;
    } else if (
      !recoveryCase.selectedFoundItemId &&
      scored.recommendation === "partial_match"
    ) {
      recoveryCase.selectedFoundItemId = item.id;
    }
    recoveryCase.updatedAt = nowIso();
    await store.saveCase(recoveryCase);

    await logActivity(
      recoveryCase.id,
      "match_compared",
      `Reviewed match for ${item.description}: ${scored.score}% (${scored.recommendation.replace(/_/g, " ")}).`,
      actor,
      {
        foundItemId: item.id,
        score: scored.score,
        recommendation: scored.recommendation,
        reasons: scored.reasons,
        rejectionReasons: scored.rejectionReasons,
        recoverable: isRecoverableItem(item),
      }
    );

    return {
      ...comparison,
      item: stripItem(item),
      recoverable: isRecoverableItem(item),
    };
  }

  async requestOwnershipEvidence(input: CaseActionInput & { foundItemId?: string }) {
    const store = await getReadyStore();
    const actor = input.actor ?? "agent";
    const recoveryCase = await this.getCase(input.recoveryCaseId);

    if (recoveryCase.ownershipLocked) {
      throw new Error(
        "Ownership verification is paused after several unsuccessful attempts. This claim is flagged for manual review."
      );
    }

    const foundItemId =
      input.foundItemId ?? recoveryCase.selectedFoundItemId ?? undefined;
    if (!foundItemId) {
      throw new Error(
        "Select or provide a foundItemId before requesting ownership evidence."
      );
    }
    const item = await store.getFoundItem(foundItemId);
    if (!item) throw new Error(`Found item not found: ${foundItemId}`);
    if (!isRecoverableItem(item)) {
      throw new Error(unavailableReason(item.status));
    }

    recoveryCase.selectedFoundItemId = foundItemId;
    assertTransition(recoveryCase.status, "ownership_pending");
    recoveryCase.status = "ownership_pending";
    recoveryCase.ownershipVerified = false;
    recoveryCase.updatedAt = nowIso();
    await store.saveCase(recoveryCase);

    const challenge = ownershipChallengePrompt();
    await logActivity(
      recoveryCase.id,
      "evidence_requested",
      `Asked the passenger to confirm ownership for ${item.description}.`,
      actor,
      { foundItemId, challengeType: challenge.challengeType }
    );

    return {
      recoveryCaseId: recoveryCase.id,
      foundItemId,
      itemSummary: `${item.description} (${item.color}) — ${item.foundLocation}`,
      custodyDomain: item.custodyDomain,
      ...challenge,
      attemptsRemaining: Math.max(
        0,
        MAX_OWNERSHIP_ATTEMPTS - (recoveryCase.ownershipFailCount ?? 0)
      ),
      warning:
        "Do not reveal or invent restricted ownership evidence. Only the passenger should supply a private detail.",
    };
  }

  async verifyOwnership(input: VerifyOwnershipInput) {
    const store = await getReadyStore();
    const actor = input.actor ?? "agent";
    const recoveryCase = await this.getCase(input.recoveryCaseId);
    const item = await store.getFoundItem(input.foundItemId);
    if (!item) throw new Error(`Found item not found: ${input.foundItemId}`);

    if (recoveryCase.ownershipLocked) {
      return {
        verified: false as const,
        message:
          "Ownership verification is paused after several unsuccessful attempts. This claim is flagged for manual review.",
        ownershipLocked: true,
        attemptsRemaining: 0,
      };
    }

    if (!isRecoverableItem(item)) {
      throw new Error(unavailableReason(item.status));
    }

    const secrets = await store.getFoundItemSecrets(input.foundItemId);
    if (!secrets?.clues?.length) {
      throw new Error("No ownership evidence protocol is configured for this item.");
    }

    const matched = evidenceMatches(input.evidence, secrets.clues);
    if (!matched) {
      const failCount = (recoveryCase.ownershipFailCount ?? 0) + 1;
      recoveryCase.ownershipFailCount = failCount;
      const locked = failCount >= MAX_OWNERSHIP_ATTEMPTS;
      recoveryCase.ownershipLocked = locked;
      recoveryCase.updatedAt = nowIso();
      await store.saveCase(recoveryCase);

      const attemptsRemaining = Math.max(0, MAX_OWNERSHIP_ATTEMPTS - failCount);
      await logActivity(
        recoveryCase.id,
        "ownership_failed",
        locked
          ? `Ownership could not be confirmed after ${failCount} attempts. Claim flagged for manual review.`
          : `Ownership could not be confirmed for ${item.description}. ${attemptsRemaining} attempt(s) remaining.`,
        actor,
        { foundItemId: input.foundItemId, failCount, ownershipLocked: locked }
      );

      return {
        verified: false as const,
        message: locked
          ? "That detail didn’t match, and the maximum number of attempts was reached. This claim is flagged for manual review — we won’t authorize pickup from this check."
          : "That detail didn’t match our records for this item. Please try another identifying detail only the owner would know.",
        ownershipLocked: locked,
        attemptsRemaining,
        failCount,
      };
    }

    recoveryCase.selectedFoundItemId = input.foundItemId;
    recoveryCase.ownershipFailCount = 0;
    recoveryCase.ownershipLocked = false;
    assertTransition(recoveryCase.status, "ownership_verified");
    recoveryCase.status = "ownership_verified";
    recoveryCase.ownershipVerified = true;
    recoveryCase.updatedAt = nowIso();
    await store.saveCase(recoveryCase);

    await logActivity(
      recoveryCase.id,
      "ownership_verified",
      `Ownership confirmed for ${item.description}.`,
      actor,
      { foundItemId: input.foundItemId }
    );

    return {
      verified: true as const,
      message: "Ownership confirmed. You can prepare pickup details next.",
      recoveryCaseId: recoveryCase.id,
      foundItemId: input.foundItemId,
      ownershipLocked: false,
      attemptsRemaining: MAX_OWNERSHIP_ATTEMPTS,
    };
  }

  async prepareRecoveryRequest(input: CaseActionInput) {
    const store = await getReadyStore();
    const actor = input.actor ?? "agent";
    const recoveryCase = await this.getCase(input.recoveryCaseId);

    if (!recoveryCase.ownershipVerified || !recoveryCase.selectedFoundItemId) {
      throw new Error(
        "Cannot prepare recovery: ownership must be verified and a found item selected."
      );
    }

    if (recoveryCase.ownershipLocked) {
      throw new Error(
        "Cannot prepare recovery: ownership verification is locked for review."
      );
    }

    const item = await store.getFoundItem(recoveryCase.selectedFoundItemId);
    if (!item) throw new Error("Selected found item no longer exists.");
    if (!isRecoverableItem(item)) {
      throw new Error(unavailableReason(item.status));
    }

    if (
      recoveryCase.recoveryPrepared &&
      recoveryCase.recoveryPacket &&
      recoveryCase.recoveryPacket.foundItemId === item.id
    ) {
      return {
        recoveryCaseId: recoveryCase.id,
        packet: recoveryCase.recoveryPacket,
        alreadyPrepared: true,
        nextStep:
          "Ask the passenger to review the pickup details and explicitly approve before calling authorize_recovery.",
      };
    }

    const pickupLocation =
      item.custodyDomain === "aircraft"
        ? "Delhi Airport Lost & Found — AeroOne transfer desk (Terminal 3)"
        : item.foundLocation;

    const packet: RecoveryPacket = {
      caseId: recoveryCase.id,
      foundItemId: item.id,
      itemSummary: `${item.description} (${item.color}${item.brand ? `, ${item.brand}` : ""})`,
      custodyOwner: item.custodyOwner,
      pickupLocation,
      pickupHours:
        "Daily 08:00–20:00 IST — bring photo ID matching the booking passenger",
      instructions: [
        "Bring this pickup confirmation and government photo ID to the desk.",
        `Reference claim ${recoveryCase.id} and item ${item.id}.`,
        "Cabin property transferred to airport lost & found is held for 30 days.",
        "Do not share private identifying details in public channels.",
      ],
      preparedAt: nowIso(),
    };

    assertTransition(recoveryCase.status, "recovery_prepared");
    recoveryCase.status = "recovery_prepared";
    recoveryCase.recoveryPrepared = true;
    recoveryCase.recoveryPacket = packet;
    recoveryCase.updatedAt = nowIso();
    await store.saveCase(recoveryCase);

    await logActivity(
      recoveryCase.id,
      "recovery_prepared",
      `Pickup instructions prepared for ${pickupLocation}. Waiting for passenger confirmation.`,
      actor,
      { packet }
    );

    return {
      recoveryCaseId: recoveryCase.id,
      packet,
      alreadyPrepared: false,
      nextStep:
        "Ask the passenger to review the pickup details and explicitly approve before calling authorize_recovery.",
    };
  }

  async authorizeRecovery(input: CaseActionInput & { humanConfirmed?: boolean }) {
    const store = await getReadyStore();
    const actor = input.actor ?? "agent";
    const recoveryCase = await this.getCase(input.recoveryCaseId);

    if (!recoveryCase.ownershipVerified) {
      throw new Error("Cannot confirm pickup: ownership is not confirmed.");
    }
    if (recoveryCase.ownershipLocked) {
      throw new Error(
        "Cannot confirm pickup: ownership verification is locked for review."
      );
    }
    if (!recoveryCase.recoveryPrepared || !recoveryCase.recoveryPacket) {
      throw new Error("Cannot confirm pickup: pickup details have not been prepared.");
    }
    if (input.humanConfirmed !== true) {
      throw new Error(
        "Passenger confirmation required. Set humanConfirmed=true only after they explicitly approve pickup."
      );
    }

    const item = await store.getFoundItem(recoveryCase.recoveryPacket.foundItemId);
    if (item && !isRecoverableItem(item)) {
      throw new Error(unavailableReason(item.status));
    }

    assertTransition(recoveryCase.status, "recovery_authorized");
    recoveryCase.status = "recovery_authorized";
    recoveryCase.recoveryAuthorized = true;
    recoveryCase.updatedAt = nowIso();
    await store.saveCase(recoveryCase);

    await logActivity(
      recoveryCase.id,
      "recovery_authorized",
      "Pickup confirmed by the passenger.",
      actor
    );

    assertTransition(recoveryCase.status, "ready_for_collection");
    recoveryCase.status = "ready_for_collection";
    recoveryCase.updatedAt = nowIso();
    await store.saveCase(recoveryCase);

    await logActivity(
      recoveryCase.id,
      "status_changed",
      `Ready for pickup at ${recoveryCase.recoveryPacket.pickupLocation}.`,
      "system",
      { status: recoveryCase.status }
    );

    return {
      recoveryCaseId: recoveryCase.id,
      status: recoveryCase.status,
      packet: recoveryCase.recoveryPacket,
      message: "Pickup confirmed. The item is ready for collection.",
    };
  }

  async getRecoveryStatus(recoveryCaseId: string) {
    const bundle = await this.getCaseBundle(recoveryCaseId);
    return {
      recoveryCaseId,
      status: bundle.recoveryCase.status,
      ownershipVerified: bundle.recoveryCase.ownershipVerified,
      recoveryPrepared: bundle.recoveryCase.recoveryPrepared,
      recoveryAuthorized: bundle.recoveryCase.recoveryAuthorized,
      ownershipFailCount: bundle.recoveryCase.ownershipFailCount ?? 0,
      ownershipLocked: Boolean(bundle.recoveryCase.ownershipLocked),
      selectedFoundItemId: bundle.recoveryCase.selectedFoundItemId,
      packet: bundle.recoveryCase.recoveryPacket,
      comparisons: bundle.recoveryCase.comparisons,
      investigationSteps: bundle.investigationSteps,
      recentActivity: bundle.activities.slice(-8),
      selectedItem: bundle.selectedItem,
    };
  }
}

export const recoveryService = new RecoveryService();
