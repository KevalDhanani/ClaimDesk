"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { InvestigationChecklist } from "@/components/InvestigationChecklist";
import { ActivityFeed } from "@/components/case/ActivityFeed";
import { MatchCard } from "@/components/case/MatchCard";
import { OwnershipSection } from "@/components/case/OwnershipSection";
import { PickupSection } from "@/components/case/PickupSection";
import { useCaseLive } from "@/hooks/useCaseLive";
import { recoveryApi } from "@/lib/api/client";
import { IconSearch } from "@/components/Icons";
import type { CustodyDomain, MatchComparison } from "@/lib/domain/types";

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const {
    recoveryCase,
    activities,
    candidates,
    selectedItem,
    investigationSteps,
    error,
    loading,
    refresh,
  } = useCaseLive(caseId);

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

  async function withBusy(key: string, fn: () => Promise<void>) {
    setBusy(key);
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
      <Link
        href="/claims"
        className="text-sm text-[var(--ink-muted)] hover:text-[var(--accent)]"
      >
        ← My claims
      </Link>

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
                  withBusy("search", async () => {
                    const res = await recoveryApi.search({
                      description: searchValue,
                      flightNumber: recoveryCase.flightNumber,
                      date: recoveryCase.travelDate,
                      custodyDomain: custody || undefined,
                      recoveryCaseId: recoveryCase.id,
                      actor: "human",
                    });
                    setLastSearchEmpty(
                      res.monitoring || (res.resultCount ?? res.results.length) === 0
                    );
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
                      That does not necessarily mean it has not been found — newly
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
                {candidates.map((item) => (
                  <MatchCard
                    key={item.id}
                    item={item}
                    comparison={comparisonsById.get(item.id)}
                    busy={!!busy}
                    ownershipLocked={Boolean(recoveryCase.ownershipLocked)}
                    onCompare={() =>
                      withBusy(`compare-${item.id}`, async () => {
                        await recoveryApi.compare({
                          recoveryCaseId: recoveryCase.id,
                          foundItemId: item.id,
                          actor: "human",
                        });
                      })
                    }
                    onRequestEvidence={() =>
                      withBusy(`evidence-${item.id}`, async () => {
                        const res = await recoveryApi.requestEvidence({
                          recoveryCaseId: recoveryCase.id,
                          foundItemId: item.id,
                          actor: "human",
                        });
                        setChallengePrompt(res.prompt ?? "");
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          <OwnershipSection
            recoveryCase={recoveryCase}
            selectedItem={selectedItem}
            evidence={evidence}
            onEvidenceChange={setEvidence}
            challengePrompt={challengePrompt}
            verifyMessage={verifyMessage}
            busy={!!busy}
            onVerify={() =>
              withBusy("verify", async () => {
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
          />

          <PickupSection
            recoveryCase={recoveryCase}
            busy={!!busy}
            onPrepare={() =>
              withBusy("prepare", async () => {
                await recoveryApi.prepare({
                  recoveryCaseId: recoveryCase.id,
                  actor: "human",
                });
              })
            }
            onAuthorize={() =>
              withBusy("authorize", async () => {
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
          />
        </div>

        <aside className="space-y-4">
          {investigationSteps.length > 0 && (
            <InvestigationChecklist steps={investigationSteps} />
          )}
          <ActivityFeed activities={activities} />
        </aside>
      </div>
    </div>
  );
}
