import type {
  Activity,
  Flight,
  FoundItemPublic,
  FoundItemSecret,
  RecoveryCase,
} from "@/lib/domain/types";

export interface DataStore {
  listFlights(): Promise<Flight[]>;
  getFlightByNumber(flightNumber: string, date?: string): Promise<Flight | null>;
  listFoundItems(): Promise<FoundItemPublic[]>;
  getFoundItem(id: string): Promise<FoundItemPublic | null>;
  getFoundItemSecrets(id: string): Promise<FoundItemSecret | null>;
  listCases(passengerId?: string): Promise<RecoveryCase[]>;
  getCase(id: string): Promise<RecoveryCase | null>;
  saveCase(recoveryCase: RecoveryCase): Promise<RecoveryCase>;
  listActivities(recoveryCaseId: string): Promise<Activity[]>;
  addActivity(activity: Activity): Promise<Activity>;
  upsertFlight(flight: Flight): Promise<void>;
  upsertFoundItem(item: FoundItemPublic, secrets?: FoundItemSecret): Promise<void>;
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${time}${rand}`;
}
