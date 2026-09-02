import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok } from "@/lib/api/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const bundle = await recoveryService.getCaseBundle(id);
    return ok(bundle);
  } catch (error) {
    return fail(error, 404);
  }
}
