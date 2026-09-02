import type {
  Activity,
  Flight,
  FoundItemPublic,
  FoundItemSecret,
  RecoveryCase,
} from "@/lib/domain/types";
import type { DataStore } from "./store";

interface MemoryDb {
  flights: Map<string, Flight>;
  foundItems: Map<string, FoundItemPublic>;
  secrets: Map<string, FoundItemSecret>;
  cases: Map<string, RecoveryCase>;
  activities: Map<string, Activity>;
}

declare global {
  var __claimdeskMemoryDb: MemoryDb | undefined;
}

function db(): MemoryDb {
  if (!global.__claimdeskMemoryDb) {
    global.__claimdeskMemoryDb = {
      flights: new Map(),
      foundItems: new Map(),
      secrets: new Map(),
      cases: new Map(),
      activities: new Map(),
    };
  }
  return global.__claimdeskMemoryDb;
}

export class MemoryStore implements DataStore {
  async listFlights(): Promise<Flight[]> {
    return Array.from(db().flights.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  async getFlightByNumber(
    flightNumber: string,
    date?: string
  ): Promise<Flight | null> {
    const items = Array.from(db().flights.values()).filter(
      (f) => f.flightNumber.toUpperCase() === flightNumber.toUpperCase()
    );
    if (date) {
      return items.find((f) => f.date === date) ?? items[0] ?? null;
    }
    return items[0] ?? null;
  }

  async listFoundItems(): Promise<FoundItemPublic[]> {
    return Array.from(db().foundItems.values());
  }

  async getFoundItem(id: string): Promise<FoundItemPublic | null> {
    return db().foundItems.get(id) ?? null;
  }

  async getFoundItemSecrets(id: string): Promise<FoundItemSecret | null> {
    return db().secrets.get(id) ?? null;
  }

  async listCases(passengerId?: string): Promise<RecoveryCase[]> {
    let cases = Array.from(db().cases.values());
    if (passengerId) {
      cases = cases.filter((c) => c.passengerId === passengerId);
    }
    return cases.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getCase(id: string): Promise<RecoveryCase | null> {
    return db().cases.get(id) ?? null;
  }

  async saveCase(recoveryCase: RecoveryCase): Promise<RecoveryCase> {
    db().cases.set(recoveryCase.id, recoveryCase);
    return recoveryCase;
  }

  async listActivities(recoveryCaseId: string): Promise<Activity[]> {
    return Array.from(db().activities.values())
      .filter((a) => a.recoveryCaseId === recoveryCaseId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async addActivity(activity: Activity): Promise<Activity> {
    db().activities.set(activity.id, activity);
    return activity;
  }

  async upsertFlight(flight: Flight): Promise<void> {
    db().flights.set(flight.id, flight);
  }

  async upsertFoundItem(
    item: FoundItemPublic,
    secrets?: FoundItemSecret
  ): Promise<void> {
    db().foundItems.set(item.id, item);
    if (secrets) {
      db().secrets.set(item.id, secrets);
    }
  }

  async clearAll(): Promise<void> {
    db().flights.clear();
    db().foundItems.clear();
    db().secrets.clear();
    db().cases.clear();
    db().activities.clear();
  }
}
