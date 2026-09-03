type JsonSchema = Record<string, unknown>;

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type ModelContext = {
  registerTool: (tool: ToolDefinition) => void | Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

async function callToolApi(path: string, input: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, actor: input.actor ?? "agent" }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Tool call failed (${res.status})`);
  }
  return data;
}

/**
 * Typical investigation order (soft guidance — server enforces security gates):
 * create_recovery_case → get_flight_details → search_found_items →
 * compare_possible_match (each candidate) → request_ownership_evidence →
 * (ask passenger; wait) → verify_ownership → prepare_recovery_request →
 * (ask approval; wait) → authorize_recovery.
 * Use get_recovery_status to resume or recover after errors — do not create duplicate cases.
 */
const tools: ToolDefinition[] = [
  {
    name: "create_recovery_case",
    description:
      "Open a NEW lost-property claim when the passenger describes a lost item and travel details. Returns recoveryCaseId required by later tools. Typical next steps: get_flight_details (pass recoveryCaseId), then search_found_items with recoveryCaseId + flightNumber + date, then compare each candidate, then ownership → prepare → human authorize. If a claim already exists for this passenger/item, call get_recovery_status instead of creating another case. If the flight is not in the schedule, the claim is still created and noted — ask the passenger to confirm flight details.",
    inputSchema: {
      type: "object",
      properties: {
        flightNumber: {
          type: "string",
          description: "Airline flight number, e.g. AO-123",
        },
        travelDate: {
          type: "string",
          description: "Travel date YYYY-MM-DD",
        },
        origin: { type: "string", description: "Departure city/airport" },
        destination: { type: "string", description: "Arrival city/airport" },
        itemDescription: {
          type: "string",
          description: "What was lost, e.g. black backpack",
        },
        lastKnownLocation: {
          type: "string",
          description:
            "Optional: aircraft, seat, gate, airport, baggage claim, or unknown",
        },
      },
      required: [
        "flightNumber",
        "travelDate",
        "origin",
        "destination",
        "itemDescription",
      ],
    },
    execute: (input) => callToolApi("/api/recovery/create-case", input),
  },
  {
    name: "get_flight_details",
    description:
      "Look up AeroOne flight details (route, aircraft, terminal, gate). Call early after create_recovery_case to ground the investigation. Always pass recoveryCaseId when you have one so the claim timeline records the lookup. If the flight is missing, ask the passenger to confirm the number, date, or route — do not invent a flight.",
    inputSchema: {
      type: "object",
      properties: {
        flightNumber: {
          type: "string",
          description: "Flight number, e.g. AO-123",
        },
        date: {
          type: "string",
          description: "Travel date YYYY-MM-DD when known",
        },
        recoveryCaseId: {
          type: "string",
          description: "Existing claim id so the lookup is logged on the case",
        },
      },
      required: ["flightNumber"],
    },
    execute: (input) => callToolApi("/api/recovery/flight-details", input),
  },
  {
    name: "search_found_items",
    description:
      "Search available (unclaimed) found-property inventory across custody domains. Always pass recoveryCaseId when a claim exists so results attach to the investigation. Prefer also passing flightNumber and date from the case. If the passenger is unsure where the item was lost, omit custodyDomain (search all), then compare candidates. When zero results: keep the case open — newly recovered items may not be entered yet; tell the passenger they can search again later. Never expect private ownership clues in results. Next: compare_possible_match once per returned foundItemId.",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Item description to match, usually from the claim",
        },
        flightNumber: {
          type: "string",
          description: "Strongly recommended when known — boosts same-flight hits",
        },
        date: {
          type: "string",
          description: "Travel/found date YYYY-MM-DD when known",
        },
        location: {
          type: "string",
          description: "Optional free-text location hint",
        },
        custodyDomain: {
          type: "string",
          enum: ["aircraft", "airport_lnf", "terminal_gate"],
          description:
            "Optional filter. Omit when the passenger is unsure where it was lost.",
        },
        recoveryCaseId: {
          type: "string",
          description:
            "Strongly recommended — attaches search results to the claim timeline",
        },
      },
      required: ["description"],
    },
    execute: (input) => callToolApi("/api/recovery/search", input),
  },
  {
    name: "get_item_details",
    description:
      "Optional. Fetch public details for one found item (no restricted ownership evidence). Usually compare_possible_match is enough after search; use this only if you need a closer look at a single candidate before or after comparing.",
    inputSchema: {
      type: "object",
      properties: {
        foundItemId: {
          type: "string",
          description: "Found item id from search results, e.g. FI-1003",
        },
        recoveryCaseId: {
          type: "string",
          description: "Optional — logs the inspection on the claim timeline",
        },
      },
      required: ["foundItemId"],
    },
    execute: (input) => callToolApi("/api/recovery/item-details", input),
  },
  {
    name: "compare_possible_match",
    description:
      "Score one candidate against the claim with deterministic reasons, rejectionReasons, and recommendation (strong_match / partial_match / unlikely / reject). Call once per search hit before requesting ownership evidence. Claimed or unavailable items are rejected. After comparing all candidates, proceed only with a strong_match, or the best partial_match if none are strong. Do not skip straight to verify_ownership.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string", description: "Claim id" },
        foundItemId: {
          type: "string",
          description: "Candidate found item id to score",
        },
      },
      required: ["recoveryCaseId", "foundItemId"],
    },
    execute: (input) => callToolApi("/api/recovery/compare", input),
  },
  {
    name: "request_ownership_evidence",
    description:
      "Start the ownership challenge for the best compared candidate (prefer strong_match). Returns a passenger-facing prompt for a private identifying detail. Do NOT invent, guess, or reveal restricted evidence. Ask the passenger the returned prompt, WAIT for their answer, then call verify_ownership with their words. Pass foundItemId when selecting a specific candidate.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string", description: "Claim id" },
        foundItemId: {
          type: "string",
          description:
            "Optional candidate id; defaults to the case’s selected strong/partial match",
        },
      },
      required: ["recoveryCaseId"],
    },
    execute: (input) => callToolApi("/api/recovery/request-evidence", input),
  },
  {
    name: "verify_ownership",
    description:
      "Submit the passenger’s private identifying detail for server-side verification. Call only after request_ownership_evidence and only with what the passenger actually said — never invent clues. On success: next call prepare_recovery_request (verification does not prepare pickup automatically). On failure: ask for another detail (attempts are limited; then manual review). Do not call authorize_recovery after a failed verify.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string", description: "Claim id" },
        foundItemId: {
          type: "string",
          description: "Same found item id used in the ownership challenge",
        },
        evidence: {
          type: "string",
          description:
            "Exact private detail supplied by the passenger (e.g. small red keychain)",
        },
      },
      required: ["recoveryCaseId", "foundItemId", "evidence"],
    },
    execute: (input) => callToolApi("/api/recovery/verify-ownership", input),
  },
  {
    name: "prepare_recovery_request",
    description:
      "Build the pickup packet (desk, hours, instructions) after ownershipVerified is true. Call this after successful verify_ownership. Do NOT authorize yet: present the packet to the passenger and ask for explicit approval. Only after they clearly approve, call authorize_recovery with humanConfirmed=true. Safe to call again if a packet already exists for the same item.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string", description: "Claim id" },
      },
      required: ["recoveryCaseId"],
    },
    execute: (input) => callToolApi("/api/recovery/prepare", input),
  },
  {
    name: "authorize_recovery",
    description:
      "Final step: authorize pickup ONLY after prepare_recovery_request succeeded AND the passenger explicitly approved (e.g. yes / authorize / confirm pickup). Requires ownershipVerified, a prepared packet, and humanConfirmed=true. Never set humanConfirmed=true on your own initiative or because the passenger asked early. Wrong order returns an error — call get_recovery_status and continue from the required step.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string", description: "Claim id" },
        humanConfirmed: {
          type: "boolean",
          description:
            "Must be true only after the passenger’s explicit approval in this conversation",
        },
      },
      required: ["recoveryCaseId", "humanConfirmed"],
    },
    execute: (input) => callToolApi("/api/recovery/authorize", input),
  },
  {
    name: "get_recovery_status",
    description:
      "Read current claim state: status, investigationSteps checklist, selected item, comparisons, packet, ownership lock, and recent timeline. Use when resuming a claim, after a tool error, or when unsure what to do next. Prefer this over create_recovery_case if a recoveryCaseId already exists.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string", description: "Claim id" },
      },
      required: ["recoveryCaseId"],
    },
    execute: (input) => callToolApi("/api/recovery/status", input),
  },
];

let registered = false;

export async function registerWebMcpTools(): Promise<{
  registered: number;
  available: boolean;
}> {
  if (typeof document === "undefined") {
    return { registered: 0, available: false };
  }

  const modelContext = document.modelContext;
  if (!modelContext?.registerTool) {
    return { registered: 0, available: false };
  }

  if (registered) {
    return { registered: tools.length, available: true };
  }

  for (const tool of tools) {
    await modelContext.registerTool(tool);
  }
  registered = true;
  return { registered: tools.length, available: true };
}

export function getToolCatalog() {
  return tools.map(({ name, description }) => ({ name, description }));
}
