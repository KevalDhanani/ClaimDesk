# ClaimDesk

Airline lost-property recovery for the OpenAI WebMCP Challenge.

**Lost after your flight. Matched, proven, ready for pickup.**

## What this is

ClaimDesk is a recovery **investigation** system for a fictional airline (AeroOne):

- Passengers describe what happened and authorize consequential recovery.
- Agents investigate across aircraft / airport / terminal custody via WebMCP tools.
- Ownership is verified with a private-evidence challenge (secrets never leave the server).
- One product, one state, one domain layer — React UI and WebMCP call the same APIs.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Firebase Firestore (Admin SDK) when configured
- In-memory store fallback for local demo without Firebase credentials

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Firebase

Set the variables in `.env.local` from `.env.example`. Use `DATA_STORE=firestore` with Admin credentials for Firebase-only mode. If Admin credentials are missing, the app uses the memory store (seeded on first request).

```bash
npm run seed   # force reseed (memory or Firestore)
```

### Golden demo path

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
