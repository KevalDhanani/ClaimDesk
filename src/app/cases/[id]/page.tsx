"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { InvestigationChecklist } from "@/components/InvestigationChecklist";
import { useCaseLive } from "@/hooks/useCaseLive";
import { recoveryApi } from "@/lib/api/client";
import { actorLabel, recommendationLabel } from "@/lib/ui/labels";
import { IconSearch } from "@/components/Icons";
import type { CustodyDomain, MatchComparison } from "@/lib/domain/types";
import { MAX_OWNERSHIP_ATTEMPTS } from "@/lib/domain/investigation";

const CUSTODY_LABEL: Record<CustodyDomain, string> = {
  aircraft: "Aircraft",
  airport_lnf: "Airport lost & found",
  terminal_gate: "Terminal / gate",
};

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const { recoveryCase, activities, candidates, selectedItem, investigationSteps, error, loading, refresh } =
    useCaseLive(caseId);

  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchDesc, setSearchDesc] = useState("");
  const [custody, setCustody] = useState<CustodyDomain | "">("");
  const [evidence, setEvidence] = useState("");
  const [challengePrompt, setChallengePrompt] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [lastSearchEmpty, setLastSearchEmpty] = useState(false);

  const comparisonsById = useMemo(() => {
    const map = new Map<string, MatchComparison>();
    recoveryCase?.comparisons.forEach((c) => map.set(c.foundItemId, c));
    return map;
  }, [recoveryCase]);

  const searchedWithNoCandidates = useMemo(() => {
    if (!recoveryCase || recoveryCase.candidateIds.length > 0) return false;
    return activities.some((a) => a.type === "search_performed");
  }, [recoveryCase, activities]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setActionError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  if (loading && !recoveryCase) {
    return (
      <div className="shell py-10 text-[var(--ink-muted)]">Loading your claim…</div>
    );
  }
  if (error || !recoveryCase) {
    return (
      <div className="shell space-y-3 py-10">
        <p className="text-[var(--danger)]">{error ?? "Claim not found"}</p>
        <Link href="/" className="text-sm text-[var(--accent)]">
          ← Back to home
        </Link>
      </div>
    );
  }

  const searchValue = searchDesc || recoveryCase.itemDescription;

  return (
    <div className="shell space-y-8 py-8 sm:py-10">
      <div>
        <Link
          href="/claims"
          className="text-sm text-[var(--ink-muted)] hover:text-[var(--accent)]"
        >
          ← My claims
        </Link>
      </div>

      <header className="surface-lg flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] text-[var(--ink-subtle)]">
            Claim {recoveryCase.id}
          </p>
          <h1 className="page-title mt-1 capitalize">{recoveryCase.itemDescription}</h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {recoveryCase.flightNumber} · {recoveryCase.origin} →{" "}
            {recoveryCase.destination} · {recoveryCase.travelDate}
            {recoveryCase.lastKnownLocation
              ? ` · Last seen: ${recoveryCase.lastKnownLocation}`
              : ""}
          </p>
        </div>
        <StatusBadge status={recoveryCase.status} />
      </header>

      {actionError && (
        <p className="rounded bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {actionError}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <section className="surface-lg p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                <IconSearch className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Search found items</h2>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  Look across aircraft holds, airport lost & found, and terminal
                  areas for a match to this claim.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="field flex-1"
                value={searchValue}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="Describe the item"
              />
              <select
                className="field sm:max-w-[200px]"
                value={custody}
                onChange={(e) => setCustody(e.target.value as CustodyDomain | "")}
              >
                <option value="">All locations</option>
                <option value="aircraft">Aircraft</option>
                <option value="airport_lnf">Airport lost & found</option>
                <option value="terminal_gate">Terminal / gate</option>
              </select>
              <button
                disabled={!!busy}
                className="btn btn-primary"
                onClick={() =>
                  run("search", async () => {
                    const res = await recoveryApi.search({
                      description: searchValue,
                      flightNumber: recoveryCase.flightNumber,
                      date: recoveryCase.travelDate,
                      custodyDomain: custody || undefined,
                      recoveryCaseId: recoveryCase.id,
                      actor: "human",
                    });
                    setLastSearchEmpty(Boolean(res.monitoring) || (res.resultCount ?? res.results.length) === 0);
                  })
                }
              >
                {busy === "search" ? "Searching…" : "Search"}
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Possible matches</h2>
            {candidates.length === 0 ? (
              <div className="surface-lg space-y-2 px-5 py-8 text-sm text-[var(--ink-muted)]">
                {lastSearchEmpty || searchedWithNoCandidates ? (
                  <>
                    <p className="font-medium text-[var(--ink)]">
                      No matching items in current inventory
                    </p>
                    <p>
                      That doesn't necessarily mean it hasn't been found — newly
                      recovered items may not be entered yet. Your claim stays open;
                      you can search again later or add more detail.
                    </p>
                  </>
                ) : (
                  <p>
                    No matches yet. Search found items to see what may belong to you.
                  </p>
                )}
              </div>
            ) : (
              <ul className="space-y-2">
                {candidates.map((item) => {
                  const cmp = comparisonsById.get(item.id);
                  const unavailable = item.status !== "unclaimed";
                  const isActionable = !unavailable && !recoveryCase.ownershipLocked;
                  const isGoodMatch = cmp && cmp.recommendation !== "no_match";
                  return (
                    <li key={item.id} className="surface-lg p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-[var(--ink)]">
                            {item.description}
                            <span className="ml-2 font-mono text-[11px] font-normal text-[var(--ink-subtle)]">
                              {item.id}
                            </span>
                          </p>
                          <p className="mt-1 text-sm text-[var(--ink-muted)]">
                            {item.foundLocation}
                          </p>
                          <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                            {CUSTODY_LABEL[item.custodyDomain]} · {item.custodyOwner}
                            {item.flightNumber ? ` · ${item.flightNumber}` : ""}
                            {unavailable ? ` · ${item.status.replace(/_/g, " ")}` : ""}
                          </p>
                        </div>
                        {unavailable ? (
                          <span className="rounded bg-[var(--danger-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--danger)]">
                            Unavailable
                          </span>
                        ) : cmp ? (
                          <span
                            className={`rounded px-2 py-1 text-[11px] font-semibold ${
                              cmp.recommendation === "strong_match"
                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                : cmp.recommendation === "partial_match"
                                  ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                                  : "bg-[#eef1f4] text-[var(--ink-muted)]"
                            }`}
                          >
                            {cmp.score}% · {recommendationLabel(cmp.recommendation)}
                          </span>
                        ) : null}
                      </div>

                      {cmp && (
                        <div className="mt-3 border-t border-[var(--border)] pt-3">
                          <ul className="space-y-1 text-xs">
                            {cmp.reasons.map((r) => (
                              <li key={r} className="flex items-start gap-1.5 text-[var(--success)]">
                                <span className="mt-0.5 shrink-0">✓</span>
                                <span>{r}</span>
                              </li>
                            ))}
                            {cmp.rejectionReasons.map((r) => (
                              <li key={r} className="flex items-start gap-1.5 text-[var(--danger)]">
                                <span className="mt-0.5 shrink-0">✗</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          disabled={!!busy}
                          className="btn btn-secondary !px-3 !py-1.5 !text-xs"
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
                          {cmp ? "Re-score" : "Review match"}
                        </button>
                        <button
                          disabled={!!busy || !isActionable}
                          className={`btn !px-3 !py-1.5 !text-xs ${
                            isActionable && isGoodMatch ? "btn-primary" : "btn-secondary"
                          }`}
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
                          Confirm it's yours
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="surface-lg p-5">
            <h2 className="text-base font-semibold">Confirm it's yours</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Public listings don't show private details. Share something only the
              owner would know so we can confirm the match.
            </p>
            {recoveryCase.ownershipLocked && (
              <p className="mt-3 rounded bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                Ownership checks are paused after {MAX_OWNERSHIP_ATTEMPTS} unsuccessful
                attempts. This claim is flagged for manual review — pickup won't be
                authorized from this check.
              </p>
            )}
            {challengePrompt && !recoveryCase.ownershipLocked && (
              <p className="mt-3 rounded bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
                {challengePrompt}
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="field flex-1"
                placeholder="e.g. small red keychain inside"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                disabled={Boolean(recoveryCase.ownershipLocked)}
              />
              <button
                disabled={
                  !!busy ||
                  !recoveryCase.selectedFoundItemId ||
                  Boolean(recoveryCase.ownershipLocked)
                }
                className="btn btn-primary"
                onClick={() =>
                  run("verify", async () => {
                    if (!recoveryCase.selectedFoundItemId) return;
                    const res = await recoveryApi.verifyOwnership({
                      recoveryCaseId: recoveryCase.id,
                      foundItemId: recoveryCase.selectedFoundItemId,
                      evidence,
                      actor: "human",
                    });
                    setVerifyMessage(res.message);
                  })
                }
              >
                Submit confirmation
              </button>
            </div>
            {!recoveryCase.ownershipVerified &&
              (recoveryCase.ownershipFailCount ?? 0) > 0 &&
              !recoveryCase.ownershipLocked && (
                <p className="mt-3 text-xs text-[var(--ink-subtle)]">
                  {recoveryCase.ownershipFailCount} unsuccessful attempt
                  {(recoveryCase.ownershipFailCount ?? 0) === 1 ? "" : "s"} ·{" "}
                  {Math.max(
                    0,
                    MAX_OWNERSHIP_ATTEMPTS - (recoveryCase.ownershipFailCount ?? 0)
                  )}{" "}
                  remaining
                </p>
              )}
            {verifyMessage && (
              <p
                className={`mt-3 text-sm font-medium ${
                  recoveryCase.ownershipVerified
                    ? "text-[var(--success)]"
                    : "text-[var(--warning)]"
                }`}
              >
                {verifyMessage}
              </p>
            )}
            {!verifyMessage && recoveryCase.ownershipVerified && (
              <p className="mt-3 text-sm font-medium text-[var(--success)]">
                Ownership confirmed
                {selectedItem ? ` for ${selectedItem.description}` : ""}.
              </p>
            )}
          </section>

          <section className="surface-lg p-5">
            <h2 className="text-base font-semibold">Pickup details</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              After ownership is confirmed, prepare pickup instructions. You must
              approve before the item is released.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={
                  !!busy ||
                  !recoveryCase.ownershipVerified ||
                  Boolean(recoveryCase.ownershipLocked)
                }
                className="btn btn-secondary"
                onClick={() =>
                  run("prepare", async () => {
                    await recoveryApi.prepare({
                      recoveryCaseId: recoveryCase.id,
                      actor: "human",
                    });
                  })
                }
              >
                Prepare pickup
              </button>
              <button
                disabled={
                  !!busy ||
                  !recoveryCase.recoveryPrepared ||
                  Boolean(recoveryCase.ownershipLocked)
                }
                className="btn btn-success"
                onClick={() =>
                  run("authorize", async () => {
                    const confirmed = window.confirm(
                      "Confirm pickup for this item? This releases it for collection."
                    );
                    if (!confirmed) throw new Error("Pickup confirmation cancelled.");
                    await recoveryApi.authorize({
                      recoveryCaseId: recoveryCase.id,
                      humanConfirmed: true,
                      actor: "human",
                    });
                  })
                }
              >
                Confirm pickup
              </button>
            </div>

            {recoveryCase.recoveryPacket && (
              <div className="mt-5 space-y-2 rounded border border-[var(--border)] bg-[var(--bg)] p-4 text-sm">
                <p className="font-semibold text-[var(--ink)]">Pickup summary</p>
                <p>{recoveryCase.recoveryPacket.itemSummary}</p>
                <p className="text-[var(--ink-muted)]">
                  Location: {recoveryCase.recoveryPacket.pickupLocation}
                </p>
                <p className="text-[var(--ink-muted)]">
                  Hours: {recoveryCase.recoveryPacket.pickupHours}
                </p>
                <p className="text-[var(--ink-muted)]">
                  Held by: {recoveryCase.recoveryPacket.custodyOwner}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
                  {recoveryCase.recoveryPacket.instructions.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

            {recoveryCase.status === "ready_for_collection" && (
              <p className="mt-4 rounded bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
                Ready for pickup
                {recoveryCase.recoveryPacket
                  ? ` at ${recoveryCase.recoveryPacket.pickupLocation}`
                  : ""}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {investigationSteps.length > 0 && (
            <InvestigationChecklist steps={investigationSteps} />
          )}
          <div className="space-y-3">
          <h2 className="text-base font-semibold">Activity</h2>
          <p className="text-xs text-[var(--ink-subtle)]">
            Updates appear as your claim progresses.
          </p>
          <ol className="space-y-2">
            {activities.length === 0 ? (
              <li className="surface-lg px-4 py-3 text-sm text-[var(--ink-muted)]">
                No activity yet.
              </li>
            ) : (
              activities
                .slice()
                .reverse()
                .map((a) => (
                  <li key={a.id} className="surface-lg px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-subtle)]">
                        {actorLabel(a.actor)}
                      </span>
                      <span className="text-[10px] text-[var(--ink-subtle)]">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-[var(--ink)]">
                      {a.message}
                    </p>
                  </li>
                ))
            )}
          </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
