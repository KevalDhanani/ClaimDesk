import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      foundItemId: string;
      recoveryCaseId?: string;
      actor?: "human" | "agent";
    }>(request);
    if (!body.foundItemId) return fail(new Error("foundItemId is required"));
    const item = await recoveryService.getItemDetails(
      body.foundItemId,
      body.recoveryCaseId,
      body.actor ?? "agent"
    );
    return ok({ item });
  } catch (error) {
    return fail(error, 404);
  }
}
