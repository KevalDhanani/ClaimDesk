import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";
import type { VerifyOwnershipInput } from "@/lib/domain/types";

export async function POST(request: Request) {
  try {
    const body = await readJson<VerifyOwnershipInput>(request);
    if (!body.recoveryCaseId || !body.foundItemId || !body.evidence) {
      return fail(
        new Error("recoveryCaseId, foundItemId, and evidence are required")
      );
    }
    const result = await recoveryService.verifyOwnership(body);
    return ok(result);
  } catch (error) {
    return fail(error, 400);
  }
}
