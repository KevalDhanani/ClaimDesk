import { forceReseed } from "../src/lib/data/seed-data";
import { getStore, usingMemoryStore } from "../src/lib/data";

async function main() {
  const store = getStore();
  await forceReseed(store);
  console.log(`Reseeded ${usingMemoryStore() ? "memory" : "firestore"} store.`);
  const flights = await store.listFlights();
  const items = await store.listFoundItems();
  console.log(`Flights: ${flights.length}, Found items: ${items.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
