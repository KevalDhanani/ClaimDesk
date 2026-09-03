# ClaimDesk

Lost property portal for AeroOne passengers. Report something left on a flight or at a partner airport, match it against found inventory, confirm it’s yours with a private detail, then approve pickup.

The usual way to do this is a form + a lot of back-and-forth. ClaimDesk keeps that as a normal website you can use yourself — and also exposes the same recovery steps as WebMCP tools. In ChatGPT’s browser (or any WebMCP host), an agent can open a claim, search inventory, score matches, and ask for ownership evidence while you stay in control of the final pickup authorization. Tools call the same Next.js APIs as the UI; Firestore stays server-only (Admin SDK).

In short: less clicking through every step when an agent helps, same safety gates (no public secrets, human confirm before release).

## Setup

### Firebase

1. Create a Firebase project and a Firestore database.
2. Deploy rules from this repo (`firestore.rules` denies all client access):

```bash
firebase deploy --only firestore:rules
```

Or paste the file into Firestore → Rules.

Collections: `flights`, `foundItems` (+ `secrets` subcollection), `recoveryCases`, `activities`.

### Env

1. Service account JSON from Project settings → Service accounts.
2. Copy `.env.example` → `.env.local`:

| JSON field | Env var |
|---|---|
| `project_id` | `FIREBASE_ADMIN_PROJECT_ID` |
| `client_email` | `FIREBASE_ADMIN_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_ADMIN_PRIVATE_KEY` |

Keep the private key quoted with `\n` escapes. Don’t commit `.env.local`.

Optional: `NEXT_PUBLIC_SITE_URL` for production OG/sitemap.

### Run

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run seed` upserts demo flights and FI-1001–1006. It doesn’t wipe claims — clear Firestore first if you want a clean slate.

## Trying it

**UI:** `/report` → open the claim → search → confirm ownership → prepare → confirm pickup.

**WebMCP:** open the site in ChatGPT’s in-app browser (or Chrome with WebMCP). Claim detail pages poll every 2s; list pages need a refresh.

### Prompts that work with the seed

Date `2026-09-01`, flight `AO-123` (Mumbai → Delhi).

1. **Happy path**

   > I lost my black backpack on AO-123 on 2026-09-01, Mumbai to Delhi. I'm not sure whether I left it on the aircraft or at the airport. Please investigate.

   Expect FI-1003 as the strong match. Ownership clue: *small red keychain*. Then approve pickup when asked.

2. **Wrong clue first** — say *blue keychain*, then *small red keychain*.

3. **No match**

   > I lost my silver watch on AO-123 on 2026-09-01.

   Claim stays open.

## Seed items

| ID | Role |
|---|---|
| FI-1001 | Reject (wrong flight) |
| FI-1002 | Partial (airport) |
| FI-1003 | Strong (aircraft; red keychain) |
| FI-1004 | Claimed — not recoverable |
| FI-1005 | Phone (so watch stays no-match) |
| FI-1006 | In transit — not recoverable |

## Stack

Next.js App Router, TypeScript, Tailwind v4, Firebase Admin / Firestore.

## WebMCP tools

`create_recovery_case`, `get_flight_details`, `search_found_items`, `get_item_details`, `compare_possible_match`, `request_ownership_evidence`, `verify_ownership`, `prepare_recovery_request`, `authorize_recovery`, `get_recovery_status`

Registered in `src/lib/webmcp/register-tools.ts`.

## License

MIT — see [LICENSE](LICENSE).
