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

const tools: ToolDefinition[] = [
  {
    name: "create_recovery_case",
    description:
      "Open a new claim from item and flight details. Contact name/email/phone are optional — do not block on them. travelDate must be YYYY-MM-DD. Returns recoveryCaseId. Next: get_flight_details, then search_found_items with recoveryCaseId + flightNumber + date. If a claim already exists, use get_recovery_status instead.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        flightNumber: {
          type: "string",
          description: "Airline flight number, e.g. AO-123",
        },
        travelDate: {
          type: "string",
          description: "Travel date YYYY-MM-DD, e.g. 2026-09-01",
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
        contactName: {
          type: "string",
          description: "Optional passenger name. Not required to open a claim.",
        },
        contactEmail: {
          type: "string",
          description: "Optional email. Not required to open a claim.",
        },
        contactPhone: {
          type: "string",
          description: "Optional phone. Not required to open a claim.",
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
      "Look up route, aircraft, terminal, and gate. Call after create_recovery_case and pass recoveryCaseId so it logs on the claim. If the flight is missing, ask the passenger to confirm — do not invent one.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Search unclaimed found items. Pass recoveryCaseId, flightNumber, and date when you have them. Omit custodyDomain if the passenger is unsure where it was lost. Zero results keep the claim open — newly recovered items may not be entered yet. Results never include private clues. Next: compare_possible_match once per foundItemId.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Optional public details for one found item (no ownership clues). Usually skip this and use compare_possible_match after search.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Score one candidate (strong_match / partial_match / unlikely / reject). Call once per search hit before ownership. Claimed or unavailable items are rejected. After all candidates, continue with a strong_match, or the best partial_match. Do not skip to verify_ownership.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Start the ownership challenge for the best compared candidate (prefer strong_match). Returns a prompt — ask the passenger, wait, then call verify_ownership with their words. Do not invent or reveal clues. Pass foundItemId when selecting a candidate.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Submit the passenger's private detail after request_ownership_evidence. Use only what they said. On success, call prepare_recovery_request next. On failure, ask again (attempts are limited, then review). Do not authorize after a failed verify.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Build pickup details after ownership is verified. Show the packet and ask for explicit approval. Only then call authorize_recovery with humanConfirmed=true. Safe to call again if a packet already exists.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Authorize pickup only after prepare_recovery_request and explicit passenger approval. Requires ownershipVerified, a prepared packet, and humanConfirmed=true. Never set humanConfirmed yourself. On error, call get_recovery_status and continue from the required step.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
      "Read claim state, checklist, selected item, comparisons, packet, and recent activity. Use to resume a claim, recover from errors, or decide the next step. Prefer this over creating a new case when recoveryCaseId already exists.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
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
