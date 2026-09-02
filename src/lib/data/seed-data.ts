import type {
  CustodyDomain,
  Flight,
  FoundItemPublic,
  FoundItemSecret,
} from "@/lib/domain/types";
import type { DataStore } from "./store";

function flight(
  id: string,
  flightNumber: string,
  date: string,
  origin: string,
  destination: string,
  departureTime: string,
  arrivalTime: string,
  aircraft: string,
  terminal: string,
  gate: string
): Flight {
  return {
    id,
    flightNumber,
    date,
    origin,
    destination,
    departureTime,
    arrivalTime,
    aircraft,
    terminal,
    gate,
  };
}

function item(
  id: string,
  description: string,
  color: string,
  foundLocation: string,
  foundAt: string,
  custodyDomain: CustodyDomain,
  custodyOwner: string,
  extras: Partial<FoundItemPublic> = {}
): FoundItemPublic {
  return {
    id,
    description,
    brand: extras.brand ?? null,
    color,
    foundLocation,
    foundAt,
    flightNumber: extras.flightNumber ?? null,
    flightDate: extras.flightDate ?? null,
    status: extras.status ?? "unclaimed",
    custodyDomain,
    custodyOwner,
  };
}

export const SEED_FLIGHTS: Flight[] = [
  flight("FL-AO101-0901", "AO-101", "2026-09-01", "Mumbai", "Bengaluru", "07:10", "09:05", "A320", "T2", "22"),
  flight("FL-AO123-0901", "AO-123", "2026-09-01", "Mumbai", "Delhi", "18:40", "21:05", "A321", "T2", "31"),
  flight("FL-AO221-0901", "AO-221", "2026-09-01", "Delhi", "Mumbai", "06:30", "08:55", "B737", "T3", "14"),
  flight("FL-AO315-0831", "AO-315", "2026-08-31", "Mumbai", "Hyderabad", "12:15", "13:45", "A320", "T2", "18"),
  flight("FL-AO407-0902", "AO-407", "2026-09-02", "Delhi", "Bengaluru", "09:20", "12:00", "A321", "T3", "8"),
  flight("FL-AO123-0831", "AO-123", "2026-08-31", "Mumbai", "Delhi", "18:40", "21:05", "A321", "T2", "29"),
];

export const SEED_ITEMS: Array<{
  item: FoundItemPublic;
  secrets?: FoundItemSecret;
}> = [
  {
    item: item(
      "FI-1001",
      "Black backpack",
      "black",
      "Mumbai Airport Lost & Found",
      "2026-09-01T10:20:00+05:30",
      "airport_lnf",
      "Mumbai Airport Lost & Found",
      { brand: "Generic", flightNumber: "AO-101", flightDate: "2026-09-01" }
    ),
    secrets: { clues: ["blue gym towel", "expired boarding pass stub"] },
  },
  {
    item: item(
      "FI-1002",
      "Black backpack",
      "black",
      "Delhi Airport Terminal 2 — Lost Property Desk",
      "2026-09-01T22:40:00+05:30",
      "airport_lnf",
      "Delhi Airport Lost & Found",
      { brand: "Wildcraft", flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
    secrets: { clues: ["yellow sticky note with grocery list", "broken umbrella"] },
  },
  {
    item: item(
      "FI-1003",
      "Black backpack",
      "black",
      "Aircraft AO-123 cabin — seat row 14",
      "2026-09-01T21:20:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { brand: "American Tourister", flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
    secrets: {
      clues: ["small red keychain inside", "silver pen in front compartment"],
    },
  },
  {
    item: item(
      "FI-2001",
      "Blue earbuds case",
      "blue",
      "Delhi Airport Terminal 3 security tray",
      "2026-09-01T15:10:00+05:30",
      "terminal_gate",
      "Delhi Airport Security",
      { brand: "Apple", flightNumber: "AO-221", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2002",
      "Brown leather wallet",
      "brown",
      "Mumbai Airport baggage claim",
      "2026-08-31T19:00:00+05:30",
      "airport_lnf",
      "Mumbai Airport Lost & Found",
      { brand: "Woodland" }
    ),
  },
  {
    item: item(
      "FI-2003",
      "Grey jacket",
      "grey",
      "Aircraft AO-315 overhead bin",
      "2026-08-31T14:00:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-315", flightDate: "2026-08-31" }
    ),
  },
  {
    item: item(
      "FI-2004",
      "Silver wristwatch",
      "silver",
      "Delhi Airport gate 14 seating",
      "2026-09-01T07:45:00+05:30",
      "terminal_gate",
      "Delhi Airport Terminal Operations",
      { brand: "Titan", flightNumber: "AO-221", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2005",
      "Camera bag",
      "black",
      "Bengaluru Airport Lost & Found",
      "2026-09-02T13:30:00+05:30",
      "airport_lnf",
      "Bengaluru Airport Lost & Found",
      { flightNumber: "AO-407", flightDate: "2026-09-02" }
    ),
  },
  {
    item: item(
      "FI-2006",
      "Laptop sleeve",
      "navy",
      "Aircraft AO-101 seat pocket",
      "2026-09-01T09:30:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-101", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2007",
      "Kindle e-reader",
      "black",
      "Hyderabad Airport Lost & Found",
      "2026-08-31T16:20:00+05:30",
      "airport_lnf",
      "Hyderabad Airport Lost & Found",
      { brand: "Amazon", flightNumber: "AO-315", flightDate: "2026-08-31" }
    ),
  },
  {
    item: item(
      "FI-2008",
      "Black over-ear headphones",
      "black",
      "Delhi Airport Terminal 2 — gate 31",
      "2026-09-01T18:10:00+05:30",
      "terminal_gate",
      "Delhi Airport Terminal Operations",
      { brand: "Sony", flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2009",
      "Passport holder",
      "burgundy",
      "Mumbai Airport check-in island B",
      "2026-09-01T16:50:00+05:30",
      "terminal_gate",
      "Mumbai Airport Terminal Operations"
    ),
  },
  {
    item: item(
      "FI-2010",
      "Stainless water bottle",
      "silver",
      "Aircraft AO-221 galley",
      "2026-09-01T08:40:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-221", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2011",
      "Sunglasses case",
      "black",
      "Delhi Airport Lost & Found",
      "2026-09-02T10:00:00+05:30",
      "airport_lnf",
      "Delhi Airport Lost & Found",
      { brand: "Ray-Ban" }
    ),
  },
  {
    item: item(
      "FI-2012",
      "Red cabin suitcase",
      "red",
      "Mumbai Airport oversized baggage",
      "2026-09-01T11:00:00+05:30",
      "airport_lnf",
      "Mumbai Airport Lost & Found",
      { brand: "Samsonite", flightNumber: "AO-101", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2013",
      "Child's stuffed elephant",
      "grey",
      "Aircraft AO-407 seat 9C",
      "2026-09-02T12:15:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-407", flightDate: "2026-09-02" }
    ),
  },
  {
    item: item(
      "FI-2014",
      "Black power bank",
      "black",
      "Delhi Airport charging lounge",
      "2026-09-01T20:05:00+05:30",
      "terminal_gate",
      "Delhi Airport Terminal Operations"
    ),
  },
  {
    item: item(
      "FI-2015",
      "Green tote bag",
      "green",
      "Bengaluru Airport arrivals",
      "2026-09-01T10:40:00+05:30",
      "airport_lnf",
      "Bengaluru Airport Lost & Found",
      { flightNumber: "AO-101", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2016",
      "Wireless mouse",
      "grey",
      "Aircraft AO-123 seat pocket",
      "2026-08-31T21:30:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { brand: "Logitech", flightNumber: "AO-123", flightDate: "2026-08-31" }
    ),
  },
  {
    item: item(
      "FI-2017",
      "Beige scarf",
      "beige",
      "Delhi Airport Terminal 3 — Lost Property Desk",
      "2026-09-01T14:25:00+05:30",
      "airport_lnf",
      "Delhi Airport Lost & Found"
    ),
  },
  {
    item: item(
      "FI-2018",
      "Tablet in folio case",
      "black",
      "Mumbai Airport security lane 4",
      "2026-09-01T17:55:00+05:30",
      "terminal_gate",
      "Mumbai Airport Security",
      { brand: "Samsung", flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2019",
      "Running shoes",
      "white",
      "Hyderabad Airport Lost & Found",
      "2026-08-31T18:00:00+05:30",
      "airport_lnf",
      "Hyderabad Airport Lost & Found",
      { brand: "Nike" }
    ),
  },
  {
    item: item(
      "FI-2020",
      "Hard-shell camera case",
      "orange",
      "Aircraft AO-221 overhead bin",
      "2026-09-01T08:50:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-221", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2021",
      "Black umbrella",
      "black",
      "Delhi Airport Terminal 2 arrivals curb",
      "2026-09-01T21:50:00+05:30",
      "airport_lnf",
      "Delhi Airport Lost & Found",
      { flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2022",
      "Prescription glasses",
      "tortoise",
      "Aircraft AO-101 seat 7A",
      "2026-09-01T09:15:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-101", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2023",
      "Navy blazer",
      "navy",
      "Mumbai Airport lounge cloak area",
      "2026-09-01T15:40:00+05:30",
      "terminal_gate",
      "Mumbai Airport Terminal Operations"
    ),
  },
  {
    item: item(
      "FI-2024",
      "Kids backpack with dinosaurs",
      "blue",
      "Delhi Airport family restroom corridor",
      "2026-09-02T11:10:00+05:30",
      "terminal_gate",
      "Delhi Airport Terminal Operations",
      { flightNumber: "AO-407", flightDate: "2026-09-02" }
    ),
  },
  {
    item: item(
      "FI-2025",
      "Travel pillow",
      "grey",
      "Aircraft AO-315 seat 21F",
      "2026-08-31T13:50:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-315", flightDate: "2026-08-31" }
    ),
  },
  {
    item: item(
      "FI-2026",
      "Gold bracelet",
      "gold",
      "Bengaluru Airport Lost & Found",
      "2026-09-02T14:00:00+05:30",
      "airport_lnf",
      "Bengaluru Airport Lost & Found"
    ),
  },
  {
    item: item(
      "FI-2027",
      "USB-C cable bundle",
      "white",
      "Delhi Airport gate 8 seating",
      "2026-09-01T08:05:00+05:30",
      "terminal_gate",
      "Delhi Airport Terminal Operations"
    ),
  },
  {
    item: item(
      "FI-2028",
      "Black briefcase",
      "black",
      "Mumbai Airport Lost & Found",
      "2026-09-01T20:30:00+05:30",
      "airport_lnf",
      "Mumbai Airport Lost & Found",
      { brand: "Vip", flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
  },
  {
    item: item(
      "FI-2029",
      "Pink water bottle",
      "pink",
      "Aircraft AO-407 galley cart",
      "2026-09-02T12:30:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { flightNumber: "AO-407", flightDate: "2026-09-02" }
    ),
  },
  {
    item: item(
      "FI-2030",
      "Folding travel map",
      "multicolor",
      "Delhi Airport tourism desk",
      "2026-09-01T16:00:00+05:30",
      "terminal_gate",
      "Delhi Airport Terminal Operations"
    ),
  },
  {
    item: item(
      "FI-2031",
      "Charcoal duffel bag",
      "charcoal",
      "Hyderabad Airport arrivals",
      "2026-08-31T15:10:00+05:30",
      "airport_lnf",
      "Hyderabad Airport Lost & Found",
      { flightNumber: "AO-315", flightDate: "2026-08-31" }
    ),
  },
  {
    item: item(
      "FI-2032",
      "Noise-cancelling earbuds",
      "black",
      "Aircraft AO-123 aisle near row 8",
      "2026-09-01T21:25:00+05:30",
      "aircraft",
      "AeroOne Cabin Lost Property",
      { brand: "Bose", flightNumber: "AO-123", flightDate: "2026-09-01" }
    ),
  },
];

export async function ensureSeeded(store: DataStore): Promise<void> {
  const existing = await store.listFoundItems();
  if (existing.some((i) => i.id === "FI-1003")) {
    return;
  }
  for (const f of SEED_FLIGHTS) {
    await store.upsertFlight(f);
  }
  for (const entry of SEED_ITEMS) {
    await store.upsertFoundItem(entry.item, entry.secrets);
  }
}

export async function forceReseed(store: DataStore): Promise<void> {
  await store.clearAll();
  for (const f of SEED_FLIGHTS) {
    await store.upsertFlight(f);
  }
  for (const entry of SEED_ITEMS) {
    await store.upsertFoundItem(entry.item, entry.secrets);
  }
}
