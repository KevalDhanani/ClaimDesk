import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";
import type { CreateCaseInput } from "@/lib/domain/types";

export async function POST(request: Request) {
  try {
    const body = await readJson<CreateCaseInput>(request);
    if (!body.flightNumber || !body.travelDate || !body.itemDescription) {
      return fail(new Error("flightNumber, travelDate, and itemDescription are required"));
    }
    if (!body.origin || !body.destination) {
      return fail(new Error("origin and destination are required"));
    }
    const recoveryCase = await recoveryService.createRecoveryCase(body);
    return ok({ recoveryCaseId: recoveryCase.id, status: recoveryCase.status, recoveryCase });
  } catch (error) {
    return fail(error, 500);
  }
}
