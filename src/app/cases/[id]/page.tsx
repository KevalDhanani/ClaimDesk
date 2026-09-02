"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { useCaseLive } from "@/hooks/useCaseLive";
import { recoveryApi } from "@/lib/api/client";
import type { CustodyDomain, MatchComparison } from "@/lib/domain/types";

const CUSTODY_LABEL: Record<CustodyDomain, string> = {
  aircraft: "Aircraft custody",
  airport_lnf: "Airport lost & found",
  terminal_gate: "Terminal / gate",
};

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const { recoveryCase, activities, candidates, selectedItem, error, loading, refresh } =
    useCaseLive(caseId);

  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchDesc, setSearchDesc] = useState("black backpack");
  const [custody, setCustody] = useState<CustodyDomain | "">("");
  const [evidence, setEvidence] = useState("");
  const [challengePrompt, setChallengePrompt] = useState<string | null>(null);

  const comparisonsById = useMemo(() => {
    const map = new Map<string, MatchComparison>();
    recoveryCase?.comparisons.forEach((c) => map.set(c.foundItemId, c));
    return map;
  }, [recoveryCase]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setActionError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading && !recoveryCase) {
    return <p className="text-[var(--ink-muted)]">Loading case file…</p>;
  }
  if (error || !recoveryCase) {
    return <p className="text-[var(--danger)]">{error ?? "Case not found"}</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-[var(--border)] pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              Recovery case · {recoveryCase.id}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {recoveryCase.itemDescription}
            </h1>
            <p className="mt-2 text-[var(--ink-muted)]">
              {recoveryCase.flightNumber} · {recoveryCase.origin} →{" "}
              {recoveryCase.destination} · {recoveryCase.travelDate}
              {recoveryCase.lastKnownLocation
                ? ` · Last known: ${recoveryCase.lastKnownLocation}`
                : ""}
            </p>
          </div>
          <StatusBadge status={recoveryCase.status} />
        </div>
      </header>

      {actionError && (
        <p className="rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {actionError}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-8">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h2 className="text-base font-semibold">Cross-custody search</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Search aircraft, airport lost & found, and terminal/gate inventories.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="Item description"
              />
              <select
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                value={custody}
                onChange={(e) => setCustody(e.target.value as CustodyDomain | "")}
              >
                <option value="">All custody domains</option>
                <option value="aircraft">Aircraft</option>
                <option value="airport_lnf">Airport L&F</option>
                <option value="terminal_gate">Terminal / gate</option>
              </select>
              <button
                disabled={!!busy}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() =>
                  run("search", async () => {
                    await recoveryApi.search({
                      description: searchDesc,
                      flightNumber: recoveryCase.flightNumber,
                      date: recoveryCase.travelDate,
                      custodyDomain: custody || undefined,
                      recoveryCaseId: recoveryCase.id,
                      actor: "human",
                    });
                  })
                }
              >
                {busy === "search" ? "Searching…" : "Search inventory"}
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Candidates & investigation notes</h2>
            {candidates.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-5 py-8 text-sm text-[var(--ink-muted)]">
                No candidates yet. Run a search or let an assistant investigate while this case is open.
              </p>
            ) : (
              <ul className="space-y-3">
                {candidates.map((item) => {
                  const cmp = comparisonsById.get(item.id);
                  return (
                    <li
                      key={item.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {item.description}{" "}
                            <span className="text-[var(--ink-muted)]">· {item.id}</span>
                          </p>
                          <p className="mt-1 text-sm text-[var(--ink-muted)]">
                            {item.foundLocation}
                          </p>
                          <p className="mt-1 text-xs text-[var(--accent)]">
                            {CUSTODY_LABEL[item.custodyDomain]} · {item.custodyOwner}
                            {item.flightNumber ? ` · ${item.flightNumber}` : ""}
                          </p>
                        </div>
                        {cmp && (
                          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                            {cmp.score}/100 · {cmp.recommendation.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      {cmp && (
                        <div className="mt-3 space-y-1 text-sm">
                          {cmp.reasons.map((r) => (
                            <p key={r} className="text-[var(--success)]">
                              + {r}
                            </p>
                          ))}
                          {cmp.rejectionReasons.map((r) => (
                            <p key={r} className="text-[var(--danger)]">
                              − {r}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          disabled={!!busy}
                          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)]"
                          onClick={() =>
                            run(`compare-${item.id}`, async () => {
                              await recoveryApi.compare({
                                recoveryCaseId: recoveryCase.id,
                                foundItemId: item.id,
                                actor: "human",
                              });
                            })
                          }
                        >
                          Compare match
                        </button>
                        <button
                          disabled={!!busy}
                          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)]"
                          onClick={() =>
                            run(`evidence-${item.id}`, async () => {
                              const res = await recoveryApi.requestEvidence({
                                recoveryCaseId: recoveryCase.id,
                                foundItemId: item.id,
                                actor: "human",
                              });
                              setChallengePrompt(String(res.prompt ?? ""));
                            })
                          }
                        >
                          Request ownership evidence
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h2 className="text-base font-semibold">Ownership verification</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Public listings omit restricted details. Provide a private identifying
              clue only you would know.
            </p>
            {challengePrompt && (
              <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
                {challengePrompt}
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                placeholder="e.g. small red keychain inside"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
              <button
                disabled={!!busy || !recoveryCase.selectedFoundItemId}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() =>
                  run("verify", async () => {
                    if (!recoveryCase.selectedFoundItemId) return;
                    await recoveryApi.verifyOwnership({
                      recoveryCaseId: recoveryCase.id,
                      foundItemId: recoveryCase.selectedFoundItemId,
                      evidence,
                      actor: "human",
                    });
                  })
                }
              >
                Verify ownership
              </button>
            </div>
            {recoveryCase.ownershipVerified && (
              <p className="mt-3 text-sm font-medium text-[var(--success)]">
                Ownership verified
                {selectedItem ? ` for ${selectedItem.id}` : ""}.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <h2 className="text-base font-semibold">Recovery packet & authorization</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              The agent (or you) prepares a pickup brief. Final authorization requires
              an explicit human decision.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={!!busy || !recoveryCase.ownershipVerified}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
                onClick={() =>
                  run("prepare", async () => {
                    await recoveryApi.prepare({
                      recoveryCaseId: recoveryCase.id,
                      actor: "human",
                    });
                  })
                }
              >
                Prepare recovery request
              </button>
              <button
                disabled={!!busy || !recoveryCase.recoveryPrepared}
                className="rounded-md bg-[var(--success)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() =>
                  run("authorize", async () => {
                    const confirmed = window.confirm(
                      "Authorize recovery for this verified item? This is a consequential action."
                    );
                    if (!confirmed) throw new Error("Authorization cancelled by human.");
                    await recoveryApi.authorize({
                      recoveryCaseId: recoveryCase.id,
                      humanConfirmed: true,
                      actor: "human",
                    });
                  })
                }
              >
                Authorize recovery
              </button>
            </div>

            {recoveryCase.recoveryPacket && (
              <div className="mt-5 space-y-2 rounded-lg bg-[var(--bg)] p-4 text-sm">
                <p className="font-medium">Prepared recovery packet</p>
                <p>{recoveryCase.recoveryPacket.itemSummary}</p>
                <p className="text-[var(--ink-muted)]">
                  Pickup: {recoveryCase.recoveryPacket.pickupLocation}
                </p>
                <p className="text-[var(--ink-muted)]">
                  Hours: {recoveryCase.recoveryPacket.pickupHours}
                </p>
                <p className="text-[var(--ink-muted)]">
                  Custody: {recoveryCase.recoveryPacket.custodyOwner}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
                  {recoveryCase.recoveryPacket.instructions.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

            {recoveryCase.status === "ready_for_collection" && (
              <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
                Ready for collection
                {recoveryCase.recoveryPacket
                  ? ` — ${recoveryCase.recoveryPacket.pickupLocation}`
                  : ""}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <h2 className="text-base font-semibold">Investigation timeline</h2>
          <p className="text-xs text-[var(--ink-muted)]">
            Updates live when you or an assistant act on this case.
          </p>
          <ol className="space-y-3">
            {activities.length === 0 ? (
              <li className="text-sm text-[var(--ink-muted)]">No activity yet.</li>
            ) : (
              activities
                .slice()
                .reverse()
                .map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)]">
                        {a.actor} · {a.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-[var(--ink-muted)]">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug">{a.message}</p>
                  </li>
                ))
            )}
          </ol>
        </aside>
      </div>
    </div>
  );
}
