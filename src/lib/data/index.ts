import { FirestoreStore } from "./firestore-store";
import type { DataStore } from "./store";
import { assertFirebaseAdminEnv } from "@/lib/firebase/admin";

declare global {
  var __claimdeskStore: DataStore | undefined;
}

export function getStore(): DataStore {
  if (global.__claimdeskStore) return global.__claimdeskStore;
  assertFirebaseAdminEnv();
  global.__claimdeskStore = new FirestoreStore();
  return global.__claimdeskStore;
}

export async function getReadyStore(): Promise<DataStore> {
  return getStore();
}
