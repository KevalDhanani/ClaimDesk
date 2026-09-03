import { SEED_FLIGHTS, SEED_FOUND_ITEMS } from "@/lib/data/seed-data";
import type { DataStore } from "@/lib/data/store";

/** Upserts demo flights + found inventory. Does not delete claims/activities. */
export async function seedDemoInventory(store: DataStore): Promise<{
  flights: number;
  foundItems: number;
}> {
  for (const flight of SEED_FLIGHTS) {
    await store.upsertFlight(flight);
  }
  for (const row of SEED_FOUND_ITEMS) {
    await store.upsertFoundItem(row.item, row.secrets);
  }
  return {
    flights: SEED_FLIGHTS.length,
    foundItems: SEED_FOUND_ITEMS.length,
  };
}
