import type { InvestigationStep } from "@/lib/domain/investigation";
import type {
  Activity,
  AuthorizeInput,
  CaseActionInput,
  CompareMatchInput,
  CompareResult,
  CreateCaseInput,
  Flight,
  FoundItemPublic,
  PrepareResult,
  RecoveryCase,
  RequestEvidenceInput,
  RequestEvidenceResult,
  SearchFoundItemsInput,
  SearchItemsResult,
  VerifyOwnershipInput,
  VerifyOwnershipResult,
} from "@/lib/domain/types";

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
    api<{ cases: RecoveryCase[]; flights: Flight[] }>("/api/recovery/dashboard"),

  getCase: (id: string) =>
    api<{
      recoveryCase: RecoveryCase;
      activities: Activity[];
      candidates: FoundItemPublic[];
      selectedItem: FoundItemPublic | null;
      investigationSteps: InvestigationStep[];
    }>(`/api/recovery/cases/${id}`),

  createCase: (body: CreateCaseInput) =>
    api<{ recoveryCaseId: string; status: string; recoveryCase: RecoveryCase }>(
      "/api/recovery/create-case",
      { method: "POST", body: JSON.stringify(body) }
    ),

  search: (body: SearchFoundItemsInput) =>
    api<SearchItemsResult>("/api/recovery/search", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  compare: (body: CompareMatchInput) =>
    api<CompareResult>("/api/recovery/compare", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  requestEvidence: (body: RequestEvidenceInput) =>
    api<RequestEvidenceResult>("/api/recovery/request-evidence", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyOwnership: (body: VerifyOwnershipInput) =>
    api<VerifyOwnershipResult>("/api/recovery/verify-ownership", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  prepare: (body: CaseActionInput) =>
    api<PrepareResult>("/api/recovery/prepare", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  authorize: (body: AuthorizeInput) =>
    api<{
      recoveryCaseId: string;
      status: string;
      packet: RecoveryCase["recoveryPacket"];
      message: string;
    }>("/api/recovery/authorize", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
