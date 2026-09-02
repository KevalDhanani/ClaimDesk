import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok } from "@/lib/api/http";

export async function GET() {
  try {
    const cases = await recoveryService.listCases();
    const flights = await recoveryService.listFlights();
    return ok({ cases, flights });
  } catch (error) {
    return fail(error, 500);
  }
}
