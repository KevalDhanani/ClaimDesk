# ClaimDesk

Airline lost-property recovery for the OpenAI WebMCP Challenge.

**Lost after your flight. Matched, proven, ready for pickup.**

## What this is

ClaimDesk is a recovery **investigation** system for a fictional airline (AeroOne):

- Passengers describe what happened and authorize consequential recovery.
- Agents investigate across aircraft / airport / terminal custody via WebMCP tools.
- Ownership is verified with a private-evidence challenge (secrets never leave the server).
- One product, one state, one domain layer — React UI and WebMCP call the same APIs.
- **All data lives in Firebase Firestore**, accessed only from the Next.js backend (Admin SDK). The browser never talks to Firestore directly.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Firebase Firestore via **Firebase Admin SDK** (server only)

## Setup

1. Copy `.env.example` to `.env.local` and set:

```env
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Golden demo path

1. Open the app in ChatGPT’s in-app browser (WebMCP) or Chrome with WebMCP enabled.
2. Ask the agent:

> I lost my black backpack on AO-123 yesterday (2026-09-01), Mumbai → Delhi. I'm not sure whether I left it on the aircraft or at the airport. Please investigate.

3. When asked for a private detail, answer: **small red keychain**
4. When asked to authorize recovery, say **yes**.
5. Watch the case file timeline update live.

## WebMCP tools

Registered via `document.modelContext.registerTool` (see `src/lib/webmcp/register-tools.ts`):

- `create_recovery_case`
- `get_flight_details`
- `search_found_items`
- `get_item_details`
- `compare_possible_match`
- `request_ownership_evidence`
- `verify_ownership`
- `prepare_recovery_request`
- `authorize_recovery`
- `get_recovery_status`
