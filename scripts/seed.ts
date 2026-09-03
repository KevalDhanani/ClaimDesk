/**
 * Upsert ClaimDesk demo flights + found inventory into Firestore.
 * Clear the DB manually first if you want a clean slate, then:
 *
 *   npm run seed
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  DEMO_PROMPTS,
  SEED_FLIGHTS,
  SEED_FOUND_ITEMS,
} from "../src/lib/data/seed-data";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env. Set FIREBASE_ADMIN_* in .env.local"
    );
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  const db = getFirestore();

  for (const flight of SEED_FLIGHTS) {
    await db.collection("flights").doc(flight.id).set(flight);
  }
  for (const row of SEED_FOUND_ITEMS) {
    const ref = db.collection("foundItems").doc(row.item.id);
    await ref.set(row.item);
    if (row.secrets) {
      await ref.collection("secrets").doc("evidence").set(row.secrets);
    }
  }

  const recoverable = SEED_FOUND_ITEMS.filter(
    (r) => r.item.status === "unclaimed"
  ).length;
  const unavailable = SEED_FOUND_ITEMS.length - recoverable;

  console.log("");
  console.log(
    `Seeded ${SEED_FLIGHTS.length} flights and ${SEED_FOUND_ITEMS.length} found items (${recoverable} available, ${unavailable} unavailable).`
  );
  console.log("");
  console.log("Inventory roles:");
  console.log("  FI-1001  reject   — black backpack, wrong flight (AO-315)");
  console.log("  FI-1002  partial  — black backpack, AO-123 airport desk");
  console.log("  FI-1003  strong   — black backpack, aircraft + small red keychain");
  console.log("  FI-1004  claimed  — filtered from recoverable search");
  console.log("  FI-1005  phone    — distractor (no silver watch in DB)");
  console.log("  FI-1006  in_transit — filtered from recoverable search");
  console.log("");
  console.log("Demo prompts:");
  console.log(`  Happy path:  ${DEMO_PROMPTS.happyPath}`);
  console.log(`  Wrong clue:  ${DEMO_PROMPTS.ownershipWrong}`);
  console.log(`  Right clue:  ${DEMO_PROMPTS.ownershipCorrect}`);
  console.log(`  No match:    ${DEMO_PROMPTS.noMatch}`);
  console.log(`  Bad flight:  ${DEMO_PROMPTS.missingFlight}`);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
