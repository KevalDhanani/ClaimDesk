import { MemoryStore } from "./memory-store";
import { FirestoreStore } from "./firestore-store";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { DataStore } from "./store";
import { ensureSeeded } from "@/lib/data/seed-data";

declare global {
  var __claimdeskStore: DataStore | undefined;
  var __claimdeskSeedPromise: Promise<void> | undefined;
}

export function getStore(): DataStore {
  if (global.__claimdeskStore) return global.__claimdeskStore;

  if (isFirebaseAdminConfigured()) {
    global.__claimdeskStore = new FirestoreStore();
  } else {
    global.__claimdeskStore = new MemoryStore();
  }
  return global.__claimdeskStore;
}

export function usingMemoryStore(): boolean {
  return !isFirebaseAdminConfigured();
}

export async function getReadyStore(): Promise<DataStore> {
  const store = getStore();
  if (!global.__claimdeskSeedPromise) {
    global.__claimdeskSeedPromise = ensureSeeded(store);
  }
  await global.__claimdeskSeedPromise;
  return store;
}
