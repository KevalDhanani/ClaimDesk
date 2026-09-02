import { recoveryService } from "@/lib/domain/recovery-service";
import { fail, ok, readJson } from "@/lib/api/http";
import type { SearchFoundItemsInput } from "@/lib/domain/types";

export async function POST(request: Request) {
  try {
    const body = await readJson<SearchFoundItemsInput>(request);
    if (!body.description) return fail(new Error("description is required"));
    const result = await recoveryService.searchFoundItems(body);
    return ok(result);
  } catch (error) {
    return fail(error, 500);
  }
}
