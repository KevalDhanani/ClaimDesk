import type { Flight, FoundItemPublic, FoundItemSecret } from "../domain/types";

/**
 * Complete demo inventory for ClaimDesk test cases.
 * After you manually clear Firestore, run: npm run seed
 *
 * Covered demos:
 * 1) Happy path + multi-match (FI-1001/1002/1003, AO-123, red keychain)
 * 2) Wrong evidence → correct evidence (FI-1003 secrets)
 * 3) Claimed / unavailable (FI-1004 claimed, FI-1006 in_transit)
 * 4) No match (no silver watch in inventory)
 * 5) Flight lookup / missing flight (AO-123 exists; AO-999 does not)
 * 6) Authorize-too-early (no seed needed — server gates)
 */

export const SEED_FLIGHTS: Flight[] = [
  {
    id: "FL-AO123-0831",
    flightNumber: "AO-123",
    date: "2026-08-31",
    origin: "Mumbai",
    destination: "Delhi",
    departureTime: "07:10",
    arrivalTime: "09:25",
    aircraft: "A321",
    terminal: "T2",
    gate: "29",
  },
  {
    id: "FL-AO315-0831",
    flightNumber: "AO-315",
    date: "2026-08-31",
    origin: "Mumbai",
    destination: "Hyderabad",
    departureTime: "14:40",
    arrivalTime: "16:05",
    aircraft: "A320",
    terminal: "T2",
    gate: "18",
  },
  {
    id: "FL-AO101-0901",
    flightNumber: "AO-101",
    date: "2026-09-01",
    origin: "Mumbai",
    destination: "Bengaluru",
    departureTime: "06:30",
    arrivalTime: "08:15",
    aircraft: "A320",
    terminal: "T2",
    gate: "22",
  },
  {
    id: "FL-AO123-0901",
    flightNumber: "AO-123",
    date: "2026-09-01",
    origin: "Mumbai",
    destination: "Delhi",
    departureTime: "07:15",
    arrivalTime: "09:30",
    aircraft: "A321",
    terminal: "T2",
    gate: "31",
  },
  {
    id: "FL-AO221-0901",
    flightNumber: "AO-221",
    date: "2026-09-01",
    origin: "Delhi",
    destination: "Mumbai",
    departureTime: "18:20",
    arrivalTime: "20:35",
    aircraft: "B737",
    terminal: "T3",
    gate: "14",
  },
  {
    id: "FL-AO407-0902",
    flightNumber: "AO-407",
    date: "2026-09-02",
    origin: "Delhi",
    destination: "Bengaluru",
    departureTime: "09:05",
    arrivalTime: "11:40",
    aircraft: "A321",
    terminal: "T3",
    gate: "8",
  },
];

export type SeedFoundItem = {
  item: FoundItemPublic;
  secrets?: FoundItemSecret;
};

export const SEED_FOUND_ITEMS: SeedFoundItem[] = [
  {
    // Reject: same item type, wrong flight
    item: {
      id: "FI-1001",
      description: "Black backpack",
      brand: "Generic",
      color: "black",
      foundLocation: "Mumbai Airport T2 — security tray area",
      foundAt: "2026-08-31T11:20:00.000Z",
      flightNumber: "AO-315",
      flightDate: "2026-08-31",
      status: "unclaimed",
      custodyDomain: "terminal_gate",
      custodyOwner: "CSMIA Terminal Security",
    },
    secrets: {
      clues: ["boarding pass stub for Hyderabad", "blue water bottle"],
    },
  },
  {
    // Partial: same flight/date, airport desk (weaker than aircraft)
    item: {
      id: "FI-1002",
      description: "Black backpack",
      brand: "American Tourister",
      color: "black",
      foundLocation: "Delhi Airport Lost & Found desk — Terminal 3",
      foundAt: "2026-09-01T12:05:00.000Z",
      flightNumber: "AO-123",
      flightDate: "2026-09-01",
      status: "unclaimed",
      custodyDomain: "airport_lnf",
      custodyOwner: "Delhi Airport Lost & Found",
    },
    secrets: {
      clues: ["gym towel", "employee ID lanyard"],
    },
  },
  {
    // Strong: aircraft cabin + golden ownership clue
    item: {
      id: "FI-1003",
      description: "Black backpack",
      brand: "Samsonite",
      color: "black",
      foundLocation: "Aircraft cabin sweep — AO-123 seat row 18",
      foundAt: "2026-09-01T10:10:00.000Z",
      flightNumber: "AO-123",
      flightDate: "2026-09-01",
      status: "unclaimed",
      custodyDomain: "aircraft",
      custodyOwner: "AeroOne Cabin Services",
    },
    secrets: {
      clues: ["small red keychain", "red keychain"],
    },
  },
  {
    // Unavailable: already claimed (filtered from recoverable search)
    item: {
      id: "FI-1004",
      description: "Black backpack",
      brand: "Wildcraft",
      color: "black",
      foundLocation: "Delhi Airport Lost & Found — already released",
      foundAt: "2026-09-01T08:40:00.000Z",
      flightNumber: "AO-123",
      flightDate: "2026-09-01",
      status: "claimed",
      custodyDomain: "airport_lnf",
      custodyOwner: "Delhi Airport Lost & Found",
    },
    secrets: {
      clues: ["orange luggage tag"],
    },
  },
  {
    // Distractor for no-match demos (search “silver watch” → 0 hits)
    item: {
      id: "FI-1005",
      description: "Black smartphone",
      brand: "Samsung",
      color: "black",
      foundLocation: "Gate 22 holding area — Mumbai T2",
      foundAt: "2026-09-01T07:50:00.000Z",
      flightNumber: "AO-101",
      flightDate: "2026-09-01",
      status: "unclaimed",
      custodyDomain: "terminal_gate",
      custodyOwner: "AeroOne Gate Team",
    },
    secrets: {
      clues: ["cracked screen protector", "green silicone case"],
    },
  },
  {
    // Unavailable: in transit (also filtered from recoverable search)
    item: {
      id: "FI-1006",
      description: "Black backpack",
      brand: "Skybags",
      color: "black",
      foundLocation: "Transfer to central lost & found — in transit",
      foundAt: "2026-09-01T11:30:00.000Z",
      flightNumber: "AO-123",
      flightDate: "2026-09-01",
      status: "in_transit",
      custodyDomain: "airport_lnf",
      custodyOwner: "Delhi Airport Lost & Found",
    },
    secrets: {
      clues: ["yellow ribbon on zipper"],
    },
  },
];

/** Operator cheat-sheet printed by npm run seed */
export const DEMO_PROMPTS = {
  happyPath:
    "I lost my black backpack on AO-123 on 2026-09-01, Mumbai to Delhi. I'm not sure whether I left it on the aircraft or at the airport. Please investigate.",
  ownershipCorrect: "There was a small red keychain inside.",
  ownershipWrong: "A blue keychain.",
  noMatch: "I lost my silver watch on AO-123 on 2026-09-01.",
  missingFlight: "I was on AO-999 yesterday.",
} as const;
