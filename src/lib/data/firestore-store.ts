import type {
  Activity,
  Flight,
  FoundItemPublic,
  FoundItemSecret,
  RecoveryCase,
} from "@/lib/domain/types";
import { getAdminDb } from "@/lib/firebase/admin";
import type { DataStore } from "./store";

export class FirestoreStore implements DataStore {
  private db() {
    return getAdminDb();
  }

  async listFlights(): Promise<Flight[]> {
    const snap = await this.db().collection("flights").get();
    return snap.docs
      .map((d) => d.data() as Flight)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getFlightByNumber(
    flightNumber: string,
    date?: string
  ): Promise<Flight | null> {
    const query = this.db()
      .collection("flights")
      .where("flightNumber", "==", flightNumber.toUpperCase());
    const snap = await query.get();
    const items = snap.docs.map((d) => d.data() as Flight);
    if (date) return items.find((f) => f.date === date) ?? items[0] ?? null;
    return items[0] ?? null;
  }

  async listFoundItems(): Promise<FoundItemPublic[]> {
    const snap = await this.db().collection("foundItems").get();
    return snap.docs.map((d) => d.data() as FoundItemPublic);
  }

  async getFoundItem(id: string): Promise<FoundItemPublic | null> {
    const doc = await this.db().collection("foundItems").doc(id).get();
    return doc.exists ? (doc.data() as FoundItemPublic) : null;
  }

  async getFoundItemSecrets(id: string): Promise<FoundItemSecret | null> {
    const doc = await this.db()
      .collection("foundItems")
      .doc(id)
      .collection("secrets")
      .doc("evidence")
      .get();
    return doc.exists ? (doc.data() as FoundItemSecret) : null;
  }

  async listCases(passengerId?: string): Promise<RecoveryCase[]> {
    let snap;
    if (passengerId) {
      snap = await this.db()
        .collection("recoveryCases")
        .where("passengerId", "==", passengerId)
        .get();
    } else {
      snap = await this.db().collection("recoveryCases").get();
    }
    return snap.docs
      .map((d) => d.data() as RecoveryCase)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getCase(id: string): Promise<RecoveryCase | null> {
    const doc = await this.db().collection("recoveryCases").doc(id).get();
    return doc.exists ? (doc.data() as RecoveryCase) : null;
  }

  async saveCase(recoveryCase: RecoveryCase): Promise<RecoveryCase> {
    await this.db()
      .collection("recoveryCases")
      .doc(recoveryCase.id)
      .set(recoveryCase);
    return recoveryCase;
  }

  async listActivities(recoveryCaseId: string): Promise<Activity[]> {
    const snap = await this.db()
      .collection("activities")
      .where("recoveryCaseId", "==", recoveryCaseId)
      .get();
    return snap.docs
      .map((d) => d.data() as Activity)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async addActivity(activity: Activity): Promise<Activity> {
    await this.db().collection("activities").doc(activity.id).set(activity);
    return activity;
  }

  async upsertFlight(flight: Flight): Promise<void> {
    await this.db().collection("flights").doc(flight.id).set(flight);
  }

  async upsertFoundItem(
    item: FoundItemPublic,
    secrets?: FoundItemSecret
  ): Promise<void> {
    const ref = this.db().collection("foundItems").doc(item.id);
    await ref.set(item);
    if (secrets) {
      await ref.collection("secrets").doc("evidence").set(secrets);
    }
  }
}
