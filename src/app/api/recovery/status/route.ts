import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recoveryCaseId = searchParams.get("recoveryCaseId");
    if (!recoveryCaseId) return fail(new Error("recoveryCaseId is required"));
    const result = await recoveryService.getRecoveryStatus(recoveryCaseId);
    return ok(result);
  } catch (error) {
    return fail(error, 404);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<{ recoveryCaseId: string }>(request);
    if (!body.recoveryCaseId) return fail(new Error("recoveryCaseId is required"));
    const result = await recoveryService.getRecoveryStatus(body.recoveryCaseId);
    return ok(result);
  } catch (error) {
    return fail(error, 404);
  }
}
