async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export const recoveryApi = {
  dashboard: () =>
    api<{ cases: import("@/lib/domain/types").RecoveryCase[]; flights: import("@/lib/domain/types").Flight[] }>(
      "/api/recovery/dashboard"
    ),
  getCase: (id: string) =>
    api<{
      recoveryCase: import("@/lib/domain/types").RecoveryCase;
      activities: import("@/lib/domain/types").Activity[];
      candidates: import("@/lib/domain/types").FoundItemPublic[];
      selectedItem: import("@/lib/domain/types").FoundItemPublic | null;
      investigationSteps: import("@/lib/domain/investigation").InvestigationStep[];
    }>(`/api/recovery/cases/${id}`),
  createCase: (body: Record<string, unknown>) =>
    api<{ recoveryCaseId: string; status: string }>("/api/recovery/create-case", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  search: (body: Record<string, unknown>) =>
    api<{
      results: Array<Record<string, unknown>>;
      resultCount?: number;
      monitoring?: boolean;
      message?: string;
      unavailableSkipped?: number;
    }>("/api/recovery/search", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  compare: (body: Record<string, unknown>) =>
    api<Record<string, unknown>>("/api/recovery/compare", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  requestEvidence: (body: Record<string, unknown>) =>
    api<Record<string, unknown>>("/api/recovery/request-evidence", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  verifyOwnership: (body: Record<string, unknown>) =>
    api<{
      verified: boolean;
      message: string;
      ownershipLocked?: boolean;
      attemptsRemaining?: number;
    }>("/api/recovery/verify-ownership", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  prepare: (body: Record<string, unknown>) =>
    api<Record<string, unknown>>("/api/recovery/prepare", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  authorize: (body: Record<string, unknown>) =>
    api<Record<string, unknown>>("/api/recovery/authorize", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
