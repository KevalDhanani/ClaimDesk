import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{
      flightNumber: string;
      date?: string;
      recoveryCaseId?: string;
      actor?: "human" | "agent";
    }>(request);
    if (!body.flightNumber) return fail(new Error("flightNumber is required"));
    const flight = await recoveryService.getFlightDetails(
      body.flightNumber,
      body.date,
      body.recoveryCaseId,
      body.actor ?? "agent"
    );
    return ok({ flight });
  } catch (error) {
    return fail(error, 404);
  }
}
