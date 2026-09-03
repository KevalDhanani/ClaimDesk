# ClaimDesk

Airline lost-property recovery for the **OpenAI WebMCP Challenge**.

**Lost after your flight. Matched, proven, ready for pickup.**

## Product

ClaimDesk is AeroOne’s passenger lost-property portal. You report something left on a flight or at a partner airport, the system searches found inventory, you confirm ownership with a private detail, then you approve pickup.

The same workflow is available to humans in the UI and to ChatGPT through **WebMCP tools**. Tools call the same Next.js APIs as the website. The browser never talks to Firestore — only the server (Firebase Admin SDK) does.

Typical flow:

1. Report a lost item → claim opened  
2. Search found inventory (aircraft, airport lost & found, terminal)  
3. Compare candidates (strong / partial / reject)  
4. Confirm ownership with a private identifying detail  
5. Prepare pickup details → passenger must explicitly approve release  

## WebMCP / challenge submission

This app is built as a **WebMCP host**: tools are registered in the page with `document.modelContext.registerTool` (`src/lib/webmcp/register-tools.ts`). There is no in-page chatbot, agent console, or MCP settings — the passenger UI is a normal lost-property site.

**Why it fits the challenge:** the agent can investigate a claim (search, score matches, request evidence) while the passenger keeps the consequential decision (authorize pickup). Ownership secrets never appear in public listings or tool output.

**How to demo for judges**

1. Deploy (or run locally) and seed inventory (`npm run seed`).  
2. Open the app in **ChatGPT’s in-app browser** (or Chrome with WebMCP enabled).  
3. Keep the claim page visible (`/cases/[id]`) while the agent works — it polls every 2 seconds.  
4. Run the happy-path prompt below, then ownership + pickup approval.

Submitted surface: the live site URL. Tools listed at the bottom of this file.

## Setup

### 1. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Create a **Firestore** database (Native mode). Start in production mode if prompted.
3. Deploy security rules from this repo (Admin SDK bypasses them; clients are denied):

```bash
# Optional: npm i -g firebase-tools && firebase login && firebase use <project-id>
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` into **Firestore → Rules** in the console and publish.

Collections used (created automatically on first write / seed):

| Collection | Purpose |
|---|---|
| `flights` | Schedule for lookup |
| `foundItems` | Public found-item inventory |
| `foundItems/{id}/secrets` | Ownership clues (never exposed to clients) |
| `recoveryCases` | Passenger claims |
| `activities` | Claim timeline |

### 2. Service account credentials

1. Firebase Console → **Project settings** → **Service accounts**.
2. **Generate new private key** → download the JSON.
3. Copy `.env.example` to `.env.local` and map:

| JSON field | Env var |
|---|---|
| `project_id` | `FIREBASE_ADMIN_PROJECT_ID` |
| `client_email` | `FIREBASE_ADMIN_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_ADMIN_PRIVATE_KEY` |

Keep the private key in double quotes with `\n` newlines, for example:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

Never commit `.env.local` or the downloaded JSON. Optional: `NEXT_PUBLIC_SITE_URL` for sitemap / Open Graph in production.

### 3. Install, seed, run

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run seed` upserts **6 flights** and **FI-1001–1006**. It does not delete existing claims. For a clean slate, clear the collections above in Firestore first, then seed.

### Deploy (e.g. Vercel)

Set the same `FIREBASE_ADMIN_*` env vars on the host (server-only). Optionally set `NEXT_PUBLIC_SITE_URL` to the public URL. Redeploy after changing env.

## How to test

**As a passenger (UI)**

1. Report an item at `/report`.  
2. Open the claim at `/cases/[id]`.  
3. Search found items → Review match → Confirm it’s yours → Prepare pickup → Confirm pickup.

**With WebMCP (ChatGPT / enabled browser)**

1. Open `http://localhost:3000` (or the deployed URL) in the agent browser.  
2. Use one of the prompts below.  
3. Watch `/claims` and the claim detail page — detail pages update live; list pages need a refresh or navigation.

## Scenarios to try (2–3)

Use the seeded inventory. Dates: **2026-09-01**. Flight: **AO-123** Mumbai → Delhi unless noted.

### 1. Happy path — black backpack (main demo)

Prompt:

> I lost my black backpack on AO-123 on 2026-09-01, Mumbai to Delhi. I'm not sure whether I left it on the aircraft or at the airport. Please investigate.

Expect:

- Claim created, flight looked up, inventory searched.  
- Compare: **FI-1001** reject (wrong flight) · **FI-1002** partial (airport) · **FI-1003** strong (aircraft cabin).  
- When asked for a private detail: **There was a small red keychain inside.**  
- Agent prepares pickup, then you approve: **Yes, authorize recovery.**  
- UI: ownership confirmed → ready for pickup at Delhi Airport Lost & Found / AeroOne transfer desk.

Claimed (**FI-1004**) and in-transit (**FI-1006**) items are not offered as recoverable.

### 2. Wrong evidence, then correct

Same backpack claim. When asked for a private detail, first say **A blue keychain.** Verification fails (limited attempts). Then: **There was a small red keychain inside.** Pickup can proceed.

### 3. No match — claim stays open

> I lost my silver watch on AO-123 on 2026-09-01.

Expect no available match (seed has no watch). The claim stays open so you can search again later. **FI-1005** is a phone, not a watch.

Optional extra: **I was on AO-999 yesterday** — claim can still open with a note that the flight is not on file.

## Seed inventory

| ID | Role |
|---|---|
| FI-1001 | Decoy — wrong flight (AO-315) |
| FI-1002 | Partial — same flight, airport desk |
| FI-1003 | Strong — aircraft cabin; secret: small red keychain |
| FI-1004 | Claimed — excluded from recoverable search |
| FI-1005 | Phone — keeps “silver watch” no-match clean |
| FI-1006 | In transit — excluded from recoverable search |

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4  
- Firebase Firestore via Firebase Admin SDK (server only)  
- IBM Plex Sans / IBM Plex Mono  

## WebMCP tools

Registered via `document.modelContext.registerTool`. Descriptions are for the agent, not the passenger UI.

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

## UI notes

Passenger copy should sound like an airline portal (claim, match, confirm ownership, pickup). Do not mention demo, Firebase, WebMCP, MCP, or AI in the UI. Timeline actors: **You** / **ClaimDesk** / **System**.
