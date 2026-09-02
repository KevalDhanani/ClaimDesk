import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      recoveryCaseId: string;
      humanConfirmed?: boolean;
      actor?: "human" | "agent";
    }>(request);
    if (!body.recoveryCaseId) return fail(new Error("recoveryCaseId is required"));
    const result = await recoveryService.authorizeRecovery(body);
    return ok(result);
  } catch (error) {
    return fail(error, 400);
  }
}
