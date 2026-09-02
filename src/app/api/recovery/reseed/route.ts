import { forceReseed } from "@/lib/data/seed-data";
import { getStore, usingMemoryStore } from "@/lib/data";
import { fail, ok } from "@/lib/api/http";

declare global {
  var __claimdeskSeedPromise: Promise<void> | undefined;
}

export async function POST() {
  try {
    const store = getStore();
    await forceReseed(store);
    global.__claimdeskSeedPromise = Promise.resolve();
    return ok({
      reseeded: true,
      store: usingMemoryStore() ? "memory" : "firestore",
    });
  } catch (error) {
    return fail(error, 500);
  }
}
