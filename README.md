# ClaimDesk

Airline lost-property recovery for the OpenAI WebMCP Challenge.

**Lost after your flight. Matched, proven, ready for pickup.**

## What this is

ClaimDesk is AeroOne’s passenger lost-property portal:

- Passengers report items left behind and confirm pickup.
- Matching, ownership confirmation, and pickup flow through one claim file.
- The browser never talks to Firestore directly — only the Next.js backend (Admin SDK) does.
- WebMCP tools (invisible in the UI) call the same APIs as the human interface.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Firebase Firestore via **Firebase Admin SDK** (server only)
- IBM Plex Sans / IBM Plex Mono (UI typography)

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

## UI design system (for future reference)

Use this section when changing look & feel so the product stays passenger-real — not a hackathon/AI demo skin.

### Product voice

- Write like an airline self-service portal (United / Emirates / IndiGo style).
- Prefer: claim, match, confirm ownership, pickup.
- Avoid in **any user-visible copy**: demo, Firebase, Firestore, WebMCP, MCP, agent, AI, investigation jargon, “hackathon”.
- Timeline actors in UI: **You** / **ClaimDesk** / **System** (map from internal `human` / `agent` / `system`).
- Keep WebMCP registration invisible (`WebMcpBootstrap` is screen-reader only).

### Visual principles

| Principle | Guidance |
|---|---|
| Facility portal | Inspired by real airline/airport lost-property pages (e.g. CSMIA-style hierarchy): hero, key info, how-it-works, then utility |
| Brand-first AeroOne | Deep navy header/footer, gold accent line in hero — not a gray SaaS admin skin |
| Minimal product core | Claims list + claim detail remain the workflow; marketing frames them |
| Anti-AI look | No purple kits, no cream+terracotta templates, no glow spam |

### Layout shells

- Full-width `main`; page sections use `.shell` (max ~1120px)
- `.hero` — atmospheric navy gradient + pattern for home/report intros
- `.info-band` / `.band` — warm key-info and how-it-works sections
- `.surface-lg` — elevated cards for claims and forms

### Brand presence

- Sticky deep-navy header with white Report CTA
- Home hero: Lost & Found for your AeroOne journey + dual CTAs
- Key information strip (cabin/airport, ownership, hours, retention)
- How it works: Match → Confirm → Collect
- Footer: full AeroOne facility-style footer
- **My claims** → `/claims`

### Icons

Inline SVGs in `src/components/Icons.tsx` (plane, search, shield, desk, luggage, route). Monochrome stroke icons.

### Do not regress

- Do not show storage/backend details in the UI
- Do not prefill “demo tip” copy on the dashboard
- Do not add Agent Mode, MCP settings, or tool consoles
- Prefer restrained radius and soft elevation over flat Bootstrap boxes

## Golden demo path (operators only — not shown in UI)

1. Optionally clear Firestore (`flights`, `foundItems`, `recoveryCases`, `activities`).
2. Seed inventory:

```bash
npm run seed
```

Writes **6 flights** + **FI-1001–1006** (does not delete existing claims unless you cleared them).

3. Open the app in ChatGPT’s in-app browser or Chrome with WebMCP enabled.
4. Prompt: lost black backpack on AO-123 (2026-09-01), Mumbai → Delhi, unsure aircraft vs airport.
5. Expect compare: **FI-1001** reject · **FI-1002** partial · **FI-1003** strong.
6. Ownership detail: **small red keychain**
7. Approve pickup when asked.

### Seed inventory (after `npm run seed`)

| ID | Role |
|---|---|
| FI-1001 | Decoy — wrong flight (AO-315) |
| FI-1002 | Partial — same flight, airport desk |
| FI-1003 | Strong — aircraft cabin + red keychain secret |
| FI-1004 | Claimed — filtered out of recoverable search |
| FI-1005 | Phone — keeps “silver watch” no-match demos clean |
| FI-1006 | In transit — filtered out of recoverable search |

### Demo beats this seed supports

1. Happy path + multi-match → verify → prepare → authorize  
2. Wrong evidence (“blue keychain”) then correct (“small red keychain”)  
3. No match (“silver watch”) — claim stays open  
4. Claimed / in_transit items never offered as recoverable  
5. Missing flight (AO-999) — claim can open with a schedule note  

Seed upserts flights/items only; clear the DB manually first for a fully clean slate.

## WebMCP tools

Registered via `document.modelContext.registerTool` (see `src/lib/webmcp/register-tools.ts`). Tool descriptions may mention agent workflows; they are not shown in the passenger UI.

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
