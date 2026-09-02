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
      "Open a new lost-property recovery investigation for a passenger. Use when the passenger describes a lost item and travel details. Returns a recoveryCaseId used by later tools.",
    inputSchema: {
      type: "object",
      properties: {
        flightNumber: { type: "string", description: "Airline flight number, e.g. AO-123" },
        travelDate: { type: "string", description: "Travel date YYYY-MM-DD" },
        origin: { type: "string" },
        destination: { type: "string" },
        itemDescription: { type: "string", description: "What was lost" },
        lastKnownLocation: {
          type: "string",
          description: "Optional: aircraft, gate, airport, etc.",
        },
      },
      required: ["flightNumber", "travelDate", "origin", "destination", "itemDescription"],
    },
    execute: (input) => callToolApi("/api/recovery/create-case", input),
  },
  {
    name: "get_flight_details",
    description:
      "Look up AeroOne flight details (route, aircraft, terminal, gate). Use early in an investigation to ground custody search. Pass recoveryCaseId when available so the case timeline records the lookup.",
    inputSchema: {
      type: "object",
      properties: {
        flightNumber: { type: "string" },
        date: { type: "string" },
        recoveryCaseId: { type: "string" },
      },
      required: ["flightNumber"],
    },
    execute: (input) => callToolApi("/api/recovery/flight-details", input),
  },
  {
    name: "search_found_items",
    description:
      "Search found-property inventory across custody domains (aircraft, airport lost & found, terminal/gate). When the passenger is unsure where the item was lost, search without restricting custodyDomain, then compare candidates. Pass recoveryCaseId to attach results to the investigation. Never expect private ownership clues in results.",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string" },
        flightNumber: { type: "string" },
        date: { type: "string" },
        location: { type: "string" },
        custodyDomain: {
          type: "string",
          enum: ["aircraft", "airport_lnf", "terminal_gate"],
        },
        recoveryCaseId: { type: "string" },
      },
      required: ["description"],
    },
    execute: (input) => callToolApi("/api/recovery/search", input),
  },
  {
    name: "get_item_details",
    description:
      "Fetch public details for a found item. Restricted ownership evidence is never returned. Use after search to inspect a candidate.",
    inputSchema: {
      type: "object",
      properties: {
        foundItemId: { type: "string" },
        recoveryCaseId: { type: "string" },
      },
      required: ["foundItemId"],
    },
    execute: (input) => callToolApi("/api/recovery/item-details", input),
  },
  {
    name: "compare_possible_match",
    description:
      "Score a candidate against the recovery case with deterministic reasons and rejectionReasons. Use to eliminate decoys and identify strong matches. Prefer comparing multiple candidates before requesting ownership evidence.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string" },
        foundItemId: { type: "string" },
      },
      required: ["recoveryCaseId", "foundItemId"],
    },
    execute: (input) => callToolApi("/api/recovery/compare", input),
  },
  {
    name: "request_ownership_evidence",
    description:
      "Start the ownership challenge protocol for a strong candidate. Returns a prompt asking the passenger for a private identifying detail. Do NOT invent or reveal restricted evidence. After the passenger answers, call verify_ownership.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string" },
        foundItemId: { type: "string" },
      },
      required: ["recoveryCaseId"],
    },
    execute: (input) => callToolApi("/api/recovery/request-evidence", input),
  },
  {
    name: "verify_ownership",
    description:
      "Submit the passenger's private identifying detail for server-side verification against restricted evidence. On success, prepare a recovery request. On failure, ask for another detail. Never claim to know the restricted clues.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string" },
        foundItemId: { type: "string" },
        evidence: {
          type: "string",
          description: "Passenger-provided private detail",
        },
      },
      required: ["recoveryCaseId", "foundItemId", "evidence"],
    },
    execute: (input) => callToolApi("/api/recovery/verify-ownership", input),
  },
  {
    name: "prepare_recovery_request",
    description:
      "Build a human-readable recovery packet (pickup desk, hours, instructions) after ownership is verified. Do not authorize yet — present the packet and ask the human for explicit approval.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string" },
      },
      required: ["recoveryCaseId"],
    },
    execute: (input) => callToolApi("/api/recovery/prepare", input),
  },
  {
    name: "authorize_recovery",
    description:
      "Authorize recovery ONLY after the human explicitly approves. Requires ownershipVerified, a prepared packet, and humanConfirmed=true. Never set humanConfirmed unless the passenger clearly said yes.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string" },
        humanConfirmed: {
          type: "boolean",
          description: "Must be true only after explicit human approval",
        },
      },
      required: ["recoveryCaseId", "humanConfirmed"],
    },
    execute: (input) => callToolApi("/api/recovery/authorize", input),
  },
  {
    name: "get_recovery_status",
    description:
      "Get the current investigation status, selected item, recovery packet, comparisons, and recent timeline for a case.",
    inputSchema: {
      type: "object",
      properties: {
        recoveryCaseId: { type: "string" },
      },
      required: ["recoveryCaseId"],
    },
    execute: (input) => callToolApi("/api/recovery/status", input),
  },
];

let registered = false;

export async function registerWebMcpTools(): Promise<{ registered: number; available: boolean }> {
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
