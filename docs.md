# Demo rehearsal — ClaimDesk

Target: under 3 minutes.

## Setup

1. Clear Firestore collections if you want a clean demo DB (`flights`, `foundItems`, `recoveryCases`, `activities`).
2. Seed inventory:

```bash
npm run seed
```

3. `npm run dev` (or open the deployed URL)
4. Open ClaimDesk in ChatGPT’s in-app browser (WebMCP) or Chrome with WebMCP enabled
5. Keep the case file visible while the agent works

## Script

### 0:00–0:15 — Problem

Show the ClaimDesk dashboard.

> “I lost my backpack after a flight. The problem isn’t just finding it — I have to figure out where it went, which found item is mine, prove ownership, and authorize recovery.”

### 0:15–0:30 — Human UI

Briefly open Report / an empty case file.

> “A traditional website makes me drive every step.”

### 0:30–1:25 — WebMCP investigation

Prompt:

> I lost my black backpack on AO-123 on 2026-09-01, Mumbai to Delhi. I'm not sure whether I left it on the aircraft or at the airport. Please investigate.

Expect: create case → flight details → search across custody → compare FI-1001 (reject) / FI-1002 (partial) / FI-1003 (strong). Timeline updates live. (FI-1004 claimed is excluded from available results.)

Optional beats:
- Wrong evidence first (“blue keychain”) → fail → then “small red keychain”
- No-match: “silver watch on AO-123” → claim stays open (no watch in seed)

### 1:25–1:50 — Ownership

When asked for a private detail:

> There was a small red keychain inside.

UI shows ownership verified. Secrets never appear in tool output.

### 1:50–2:10 — Authorization

Agent prepares recovery packet, asks for approval.

> Yes, authorize recovery.

UI: Ready for collection — Delhi Airport Lost & Found / AeroOne transfer desk.

### 2:10–2:25 — Close

> “ClaimDesk doesn’t add a chatbot to lost-and-found. It exposes the recovery workflow as structured capabilities. The investigation runs; you keep the consequential decision.”

End on:

**ClaimDesk**  
*Lost after your flight. Matched, proven, ready for pickup.*

## Deploy notes

1. Set `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` on Vercel (server env only)
2. Deploy to Vercel
