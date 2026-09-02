import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";
import type { CompareMatchInput } from "@/lib/domain/types";

export async function POST(request: Request) {
  try {
    const body = await readJson<CompareMatchInput>(request);
    if (!body.recoveryCaseId || !body.foundItemId) {
      return fail(new Error("recoveryCaseId and foundItemId are required"));
    }
    const result = await recoveryService.comparePossibleMatch(body);
    return ok(result);
  } catch (error) {
    return fail(error, 400);
  }
}
