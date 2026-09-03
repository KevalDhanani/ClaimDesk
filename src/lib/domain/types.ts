export type CustodyDomain = "aircraft" | "airport_lnf" | "terminal_gate";

export type CaseStatus =
  | "draft"
  | "investigating"
  | "candidates_found"
  | "ownership_pending"
  | "ownership_verified"
  | "recovery_prepared"
  | "recovery_authorized"
  | "ready_for_collection";

export type ActivityType =
  | "case_created"
  | "flight_looked_up"
  | "search_performed"
  | "item_inspected"
  | "match_compared"
  | "evidence_requested"
  | "ownership_verified"
  | "ownership_failed"
  | "recovery_prepared"
  | "recovery_authorized"
  | "status_changed"
  | "note";

export interface Flight {
  id: string;
  flightNumber: string;
  date: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  aircraft: string;
  terminal: string;
  gate: string;
}

export interface FoundItemPublic {
  id: string;
  description: string;
  brand: string | null;
  color: string;
  foundLocation: string;
  foundAt: string;
  flightNumber: string | null;
  flightDate: string | null;
  status: "unclaimed" | "claimed" | "in_transit";
  custodyDomain: CustodyDomain;
  custodyOwner: string;
}

export interface FoundItemSecret {
  clues: string[];
}

export interface MatchComparison {
  foundItemId: string;
  score: number;
  reasons: string[];
  rejectionReasons: string[];
  recommendation: "strong_match" | "partial_match" | "unlikely" | "reject";
  comparedAt: string;
}

export interface RecoveryPacket {
  caseId: string;
  foundItemId: string;
  itemSummary: string;
  custodyOwner: string;
  pickupLocation: string;
  pickupHours: string;
  instructions: string[];
  preparedAt: string;
}

export interface RecoveryCase {
  id: string;
  passengerId: string;
  flightNumber: string;
  travelDate: string;
  origin: string;
  destination: string;
  itemDescription: string;
  lastKnownLocation: string | null;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: CaseStatus;
  candidateIds: string[];
  comparisons: MatchComparison[];
  selectedFoundItemId: string | null;
  ownershipVerified: boolean;
  recoveryPrepared: boolean;
  recoveryAuthorized: boolean;
  recoveryPacket: RecoveryPacket | null;
  ownershipFailCount?: number;
  ownershipLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  recoveryCaseId: string;
  type: ActivityType;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
  actor: "human" | "agent" | "system";
}

export interface CreateCaseInput {
  flightNumber: string;
  travelDate: string;
  origin: string;
  destination: string;
  itemDescription: string;
  lastKnownLocation?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  actor?: "human" | "agent";
}

export interface SearchFoundItemsInput {
  description: string;
  flightNumber?: string;
  date?: string;
  location?: string;
  custodyDomain?: CustodyDomain;
  recoveryCaseId?: string;
  actor?: "human" | "agent";
}

export interface CompareMatchInput {
  recoveryCaseId: string;
  foundItemId: string;
  actor?: "human" | "agent";
}

export interface VerifyOwnershipInput {
  recoveryCaseId: string;
  foundItemId: string;
  evidence: string;
  actor?: "human" | "agent";
}

export interface CaseActionInput {
  recoveryCaseId: string;
  actor?: "human" | "agent";
}

export interface AuthorizeInput extends CaseActionInput {
  humanConfirmed: boolean;
}

export interface RequestEvidenceInput extends CaseActionInput {
  foundItemId?: string;
}

export interface SearchHit {
  foundItemId: string;
  description: string;
  color: string;
  brand: string | null;
  foundLocation: string;
  foundAt: string;
  flightNumber: string | null;
  flightDate: string | null;
  custodyDomain: CustodyDomain;
  custodyOwner: string;
  status: FoundItemPublic["status"];
  matchContext?: string;
}

export interface SearchItemsResult {
  results: SearchHit[];
  resultCount: number;
  unavailableSkipped: number;
  monitoring: boolean;
  message: string;
}

export interface CompareResult extends MatchComparison {
  item: FoundItemPublic;
  recoverable: boolean;
}

export interface RequestEvidenceResult {
  recoveryCaseId: string;
  foundItemId: string;
  itemSummary: string;
  custodyDomain: CustodyDomain;
  challengeType: string;
  prompt: string;
  guidance: string;
  attemptsRemaining: number;
  warning: string;
}

export interface VerifyOwnershipResult {
  verified: boolean;
  message: string;
  ownershipLocked?: boolean;
  attemptsRemaining?: number;
}

export interface PrepareResult {
  recoveryCaseId: string;
  packet: RecoveryPacket;
  alreadyPrepared: boolean;
  nextStep: string;
}

export const STATUS_ORDER: CaseStatus[] = [
  "draft",
  "investigating",
  "candidates_found",
  "ownership_pending",
  "ownership_verified",
  "recovery_prepared",
  "recovery_authorized",
  "ready_for_collection",
];

export const DEMO_PASSENGER_ID = "demo-passenger";
