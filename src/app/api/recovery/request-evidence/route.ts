import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      recoveryCaseId: string;
      foundItemId?: string;
      actor?: "human" | "agent";
    }>(request);
    if (!body.recoveryCaseId) return fail(new Error("recoveryCaseId is required"));
    const result = await recoveryService.requestOwnershipEvidence(body);
    return ok(result);
  } catch (error) {
    return fail(error, 400);
  }
}
