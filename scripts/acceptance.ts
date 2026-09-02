/**
 * Golden-path acceptance test against a running server.
 * Usage: npx tsx scripts/acceptance.ts [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3000";

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path}: ${data.error || res.status}`);
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(`${path}: ${data.error || res.status}`);
  return data as T;
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log(`Acceptance against ${BASE}`);

  await post("/api/recovery/reseed", {});

  const created = await post<{ recoveryCaseId: string }>("/api/recovery/create-case", {
    flightNumber: "AO-123",
    travelDate: "2026-09-01",
    origin: "Mumbai",
    destination: "Delhi",
    itemDescription: "black backpack",
    lastKnownLocation: "aircraft",
    actor: "agent",
  });
  const caseId = created.recoveryCaseId;
  console.log("case", caseId);

  await post("/api/recovery/flight-details", {
    flightNumber: "AO-123",
    date: "2026-09-01",
    recoveryCaseId: caseId,
  });

  const search = await post<{ results: Array<{ foundItemId: string }> }>(
    "/api/recovery/search",
    {
      description: "black backpack",
      flightNumber: "AO-123",
      date: "2026-09-01",
      recoveryCaseId: caseId,
      actor: "agent",
    }
  );
  const ids = search.results.map((r) => r.foundItemId);
  assert(ids.includes("FI-1001"), "FI-1001 should appear");
  assert(ids.includes("FI-1002"), "FI-1002 should appear");
  assert(ids.includes("FI-1003"), "FI-1003 should appear");

  const c1 = await post<{ score: number; recommendation: string }>(
    "/api/recovery/compare",
    { recoveryCaseId: caseId, foundItemId: "FI-1001", actor: "agent" }
  );
  const c2 = await post<{ score: number; recommendation: string }>(
    "/api/recovery/compare",
    { recoveryCaseId: caseId, foundItemId: "FI-1002", actor: "agent" }
  );
  const c3 = await post<{ score: number; recommendation: string }>(
    "/api/recovery/compare",
    { recoveryCaseId: caseId, foundItemId: "FI-1003", actor: "agent" }
  );
  console.log("scores", { FI1001: c1.score, FI1002: c2.score, FI1003: c3.score });
  assert(c3.score > c2.score, "FI-1003 should score above FI-1002");
  assert(c3.score > c1.score, "FI-1003 should score above FI-1001");
  assert(
    c1.recommendation === "reject" || c1.score < 50,
    "FI-1001 should be weak/reject"
  );

  const details = await post<{ item: Record<string, unknown> }>(
    "/api/recovery/item-details",
    { foundItemId: "FI-1003", recoveryCaseId: caseId }
  );
  assert(!("privateEvidence" in details.item), "secrets must not leak");
  assert(!("clues" in details.item), "secrets must not leak");

  await post("/api/recovery/request-evidence", {
    recoveryCaseId: caseId,
    foundItemId: "FI-1003",
    actor: "agent",
  });

  const bad = await post<{ verified: boolean }>("/api/recovery/verify-ownership", {
    recoveryCaseId: caseId,
    foundItemId: "FI-1003",
    evidence: "totally wrong clue",
    actor: "agent",
  });
  assert(!bad.verified, "bad evidence must fail");

  const good = await post<{ verified: boolean }>("/api/recovery/verify-ownership", {
    recoveryCaseId: caseId,
    foundItemId: "FI-1003",
    evidence: "small red keychain",
    actor: "agent",
  });
  assert(good.verified, "red keychain must verify");

  try {
    await post("/api/recovery/authorize", {
      recoveryCaseId: caseId,
      humanConfirmed: true,
      actor: "agent",
    });
    throw new Error("authorize should fail before prepare");
  } catch (e) {
    assert(
      e instanceof Error && e.message.includes("packet"),
      "expected prepare gate"
    );
  }

  await post("/api/recovery/prepare", { recoveryCaseId: caseId, actor: "agent" });

  try {
    await post("/api/recovery/authorize", {
      recoveryCaseId: caseId,
      humanConfirmed: false,
      actor: "agent",
    });
    throw new Error("authorize should require humanConfirmed");
  } catch (e) {
    assert(
      e instanceof Error && e.message.toLowerCase().includes("human"),
      "expected human confirmation gate"
    );
  }

  const auth = await post<{ status: string }>("/api/recovery/authorize", {
    recoveryCaseId: caseId,
    humanConfirmed: true,
    actor: "agent",
  });
  assert(auth.status === "ready_for_collection", "final status");

  const bundle = await get<{
    activities: unknown[];
    recoveryCase: { status: string };
  }>(`/api/recovery/cases/${caseId}`);
  assert(bundle.recoveryCase.status === "ready_for_collection", "case status");
  assert(bundle.activities.length >= 5, "timeline should have real activities");

  console.log("ALL ACCEPTANCE CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
