# ClaimDesk — MASTER PRODUCT & BUILD SPECIFICATION

## WebMCP Hackathon Project

### Version

v2.0 — Final Build Specification

---

# 1. PRODUCT OVERVIEW

## Product name

**ClaimDesk**

## Tagline

**Lost after your flight. Matched, proven, ready for pickup.**

## One-line pitch

> ClaimDesk turns airline lost-and-found from a fragmented form-filling process into an agent-led investigation, where an AI agent searches, compares and verifies possible matches while the human remains in control of consequential recovery decisions.

---

# 2. HACKATHON OBJECTIVE

Build a polished, working web application demonstrating how WebMCP enables an AI agent to operate a real application through semantic business capabilities rather than attempting to navigate buttons, forms and pages.

The application must work in two equivalent ways:

### Human interaction

A human uses the normal ClaimDesk website:

```text
Dashboard
→ Report Lost Item
→ Investigation
→ Possible Matches
→ Ownership Verification
→ Recovery Authorization
→ Recovery Status
```

### Agent interaction

An AI agent operating through WebMCP performs the same underlying operations:

```text
create_recovery_case
→ search_found_items
→ get_item_details
→ compare_possible_match
→ request_ownership_evidence
→ verify_ownership
→ prepare_recovery_request
→ authorize_recovery
→ get_recovery_status
```

There must NOT be a separate "AI dashboard", "Agent Mode", or second frontend.

WebMCP is an additional machine-readable interface to the same application.

---

# 3. CORE PRODUCT PRINCIPLE

## One product. One state. One business-logic layer. Two interfaces.

Architecture:

```text
                    ClaimDesk WEB APP
                          |
             +------------+------------+
             |                         |
         HUMAN UI                  AI AGENT
             |                         |
          React UI                 WebMCP
             |                       tools
             +------------+------------+
                          |
                   DOMAIN SERVICES
                          |
                       DATABASE
                          |
                    APPLICATION STATE
```

Both the human UI and WebMCP tools MUST call the same domain/service layer.

Do not implement separate business logic for the agent.

Example:

```text
RecoveryService.createCase()
RecoveryService.searchFoundItems()
RecoveryService.compareMatch()
RecoveryService.verifyOwnership()
RecoveryService.prepareRecovery()
RecoveryService.authorizeRecovery()
RecoveryService.getStatus()
```

The React interface calls these services.

WebMCP tools call these same services.

---

# 4. WHY THIS PRODUCT EXISTS

Airline lost-and-found is an investigation problem disguised as a form-filling problem.

A passenger may not know:

* whether they lost the item on the aircraft or in the airport
* which department has the item
* whether a found item is actually theirs
* how to describe the item sufficiently
* what information is required to establish ownership
* whether the item has been found
* what they need to do next

Traditional workflows often require the passenger to navigate several pages, submit reports and communicate with different lost-property operations.

ClaimDesk changes the interaction model.

Instead of asking:

> "Which form do I fill out?"

the passenger says:

> "Here's what happened."

The agent investigates.

---

# 5. TARGET USER

Primary user:

**Airline passenger who has lost personal property during a journey.**

Secondary future users:

* airlines
* airport lost-and-found teams
* ground handling organizations
* transportation operators
* hotels and other travel organizations

For the hackathon prototype, DO NOT build a multi-organization platform.

Build one fictional airline environment.

---

# 6. DEMO AIRLINE

Use a fictional airline:

**AeroOne**

Do NOT copy Air India, Emirates, IndiGo, Delta, American Airlines or any other real airline's branding.

The workflow can be inspired by real-world airline/airport lost-property processes, but the demo UI, branding and data must be fictional.

---

# 7. PRIMARY DEMO SCENARIO

This is the most important scenario in the application.

Passenger traveled:

```text
Flight: AO-123
Route: Mumbai → Delhi
Date: September 1, 2026
```

Passenger believes they lost:

```text
Black backpack
```

But they aren't certain whether they left it:

* on the aircraft
* at the gate
* somewhere in Delhi airport

The passenger tells the agent:

> "I lost my black backpack on AO-123 yesterday. I'm not sure if I left it on the aircraft or at the airport. Can you investigate?"

The agent should independently investigate.

---

# 8. EXPECTED AGENT INVESTIGATION

The agent should:

### Step 1 — Create recovery case

Create a recovery case containing:

* flight number
* date
* origin
* destination
* item description
* last known location if known

---

### Step 2 — Search found inventory

Search multiple relevant locations.

For example:

```text
Aircraft inventory
Delhi Airport Lost & Found
Terminal/gate inventory
```

The system should return multiple possible matches.

---

### Step 3 — Compare candidates

Example seeded results:

### Candidate A

```text
Black backpack
Found: Mumbai Airport
Flight: AO-101
```

Reject because flight doesn't match.

### Candidate B

```text
Black backpack
Found: Delhi Airport Terminal 2
Flight: AO-123
```

But the found location/time should create a weaker match.

### Candidate C

```text
Black backpack
Found: Aircraft AO-123
Date: September 1
```

Strong candidate.

The agent should reason over these candidates rather than immediately receiving a perfect answer.

---

# 9. OWNERSHIP VERIFICATION

This is the signature feature.

Public found-item information must NOT contain all identifying information.

Example public record:

```text
Black backpack
Flight AO-123
Found on aircraft
September 1
Status: Unclaimed
```

Private/restricted evidence stored internally:

```text
Small red keychain inside
Silver pen in front compartment
```

The agent should NOT reveal the restricted information to the user.

Instead it should ask:

> "Tell me one identifying detail inside the backpack that wouldn't be visible from the listing."

User responds:

> "There was a small red keychain inside."

The agent submits that evidence to:

```text
verify_ownership
```

The system verifies it against restricted evidence.

---

# 10. MATCH SCORING

Use deterministic business logic.

Do NOT claim the score is an actual statistical probability.

Example:

```text
Flight match             +25
Date match               +20
Location match           +15
Description match        +15
Brand match              +10
Private evidence match  +15
--------------------------------
Maximum                  100
```

Display:

```text
92 — Strong match
```

or:

```text
100 — Ownership verified
```

The UI should show the reasons:

```text
✓ Flight matches
✓ Date matches
✓ Found location matches
✓ Description matches
✓ Ownership evidence verified
```

The wording should be:

**"Match score"** or **"Evidence strength"**, not "99% probability you own this item."

---

# 11. HUMAN CONTROL / SAFETY BOUNDARY

The agent should be autonomous for investigation but NOT autonomous for consequential recovery authorization.

Agent may:

* create cases
* search inventory
* inspect public item information
* compare candidates
* investigate
* request evidence
* verify evidence
* prepare recovery requests
* check status

Human must approve:

**Final recovery authorization.**

The intended workflow:

```text
AGENT
Investigate
   ↓
Find candidate
   ↓
Verify ownership
   ↓
Prepare recovery
   ↓
        HUMAN
        ↓
"Authorize recovery?"
        ↓
       YES
        ↓
AGENT
Authorize recovery
```

This creates a meaningful human-agent collaboration model.

---

# 12. WEBMCP TOOLS

Implement the following tools.

## 12.1 create_recovery_case

Purpose:

Create a new lost-property recovery investigation.

Input:

```json
{
  "flightNumber": "AO-123",
  "travelDate": "2026-09-01",
  "origin": "Mumbai",
  "destination": "Delhi",
  "itemDescription": "black backpack",
  "lastKnownLocation": "aircraft"
}
```

Output:

```json
{
  "recoveryCaseId": "RC-10482",
  "status": "investigating"
}
```

---

## 12.2 search_found_items

Purpose:

Search the found-property inventory.

Input:

```json
{
  "description": "black backpack",
  "flightNumber": "AO-123",
  "date": "2026-09-01",
  "location": "aircraft"
}
```

Output should contain candidates.

Example:

```json
{
  "results": [
    {
      "foundItemId": "FI-1001",
      "description": "Black backpack",
      "foundLocation": "Mumbai Airport",
      "matchContext": "flight mismatch"
    },
    {
      "foundItemId": "FI-1002",
      "description": "Black backpack",
      "foundLocation": "Delhi Airport Terminal 2"
    },
    {
      "foundItemId": "FI-1003",
      "description": "Black backpack",
      "foundLocation": "AO-123 aircraft"
    }
  ]
}
```

Do not expose restricted ownership evidence.

---

## 12.3 get_item_details

Input:

```json
{
  "foundItemId": "FI-1003"
}
```

Return public details:

* description
* brand if available
* color
* found location
* found date/time
* associated flight
* status

Do not return private ownership evidence.

---

## 12.4 get_flight_details

Input:

```json
{
  "flightNumber": "AO-123",
  "travelDate": "2026-09-01"
}
```

Return:

* flight number
* route
* departure
* arrival
* aircraft
* terminal/gate information
* status

---

## 12.5 compare_possible_match

Input:

```json
{
  "recoveryCaseId": "RC-10482",
  "foundItemId": "FI-1003"
}
```

Return:

```json
{
  "score": 75,
  "strength": "strong_candidate",
  "reasons": [
    "Flight matches",
    "Date matches",
    "Description matches",
    "Found location is consistent"
  ],
  "requiresAdditionalEvidence": true
}
```

---

## 12.6 request_ownership_evidence

Input:

```json
{
  "recoveryCaseId": "RC-10482",
  "foundItemId": "FI-1003"
}
```

Return:

```json
{
  "question": "Tell me one identifying detail inside the item that would not be visible from the public listing."
}
```

The system must NOT reveal the answer.

---

## 12.7 verify_ownership

Input:

```json
{
  "recoveryCaseId": "RC-10482",
  "foundItemId": "FI-1003",
  "evidence": "There was a small red keychain inside."
}
```

Return:

```json
{
  "verified": true,
  "score": 100,
  "strength": "verified",
  "matchedEvidence": true,
  "reasons": [
    "Flight matches",
    "Date matches",
    "Location matches",
    "Description matches",
    "Private ownership evidence matches"
  ]
}
```

Do not return the private stored evidence verbatim.

---

## 12.8 prepare_recovery_request

Input:

```json
{
  "recoveryCaseId": "RC-10482",
  "foundItemId": "FI-1003"
}
```

Return:

```json
{
  "status": "ready_for_authorization",
  "pickupLocation": "Delhi Airport Lost & Found",
  "pickupWindow": "09:00–18:00",
  "representativeAllowed": true
}
```

This does NOT authorize recovery.

---

## 12.9 authorize_recovery

Input:

```json
{
  "recoveryCaseId": "RC-10482"
}
```

This action should only succeed after the application has entered a state where explicit human authorization has been obtained.

Return:

```json
{
  "status": "authorized",
  "message": "Recovery authorized successfully."
}
```

---

## 12.10 get_recovery_status

Input:

```json
{
  "recoveryCaseId": "RC-10482"
}
```

Return:

```json
{
  "status": "ready_for_collection",
  "item": "Black backpack",
  "location": "Delhi Airport Lost & Found"
}
```

---

# 13. OUT OF V1 — TRACKER (DO NOT BUILD)

Tracker tools (`get_tracking_location`, `share_tracking_location`) are **out of v1**.

They must not dilute the ownership-verification and human-authorization demo spine.

Do not implement them until the primary investigation flow is complete and polished.

---

# 14. WEBMCP IMPLEMENTATION

Register WebMCP tools through the browser's model context API.

Conceptually:

```javascript
document.modelContext.registerTool({
  name: "search_found_items",
  description: "...",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  execute: async (input) => {
    return await recoveryService.searchFoundItems(input);
  }
});
```

Implement the actual tools using the application's service layer.

Do NOT implement tools as simulated clicks.

Bad:

```text
clickSearchButton()
fillForm()
clickSubmit()
```

Good:

```text
search_found_items()
compare_possible_match()
verify_ownership()
prepare_recovery_request()
```

Tools should express semantic business capabilities.

---

# 15. IMPORTANT WEBMCP DESIGN PRINCIPLE

WebMCP should be invisible to the normal human user.

The normal website should not contain:

* WebMCP settings
* Agent mode switch
* MCP dashboard
* Tool list page
* "Connect AI" button
* fake AI console

The application should simply expose its capabilities.

The OpenAI agent discovers those capabilities through WebMCP.

---

# 16. NORMAL HUMAN UI

The human website must be completely usable without WebMCP.

Required pages:

## Dashboard

Show:

* ClaimDesk branding
* active recovery cases
* recent flights
* recovery history
* quick action: Report lost item

Example:

```text
ClaimDesk

Welcome back

Active recovery
AO-123 · Mumbai → Delhi
Black backpack
Investigation in progress

[Open recovery]
```

---

# 17. REPORT LOST ITEM

Human-friendly form.

Fields:

* Flight
* Date
* Origin
* Destination
* Item description
* Last known location
* optional brand
* optional color
* optional notes

After submission:

Create the exact same recovery case that the WebMCP tool would create.

---

# 18. RECOVERY CASE PAGE

This is the most important UI.

Show:

### Case header

```text
Recovery #RC-10482

Black backpack

AO-123
Mumbai → Delhi
September 1, 2026
```

### Current status

```text
INVESTIGATION IN PROGRESS
```

### Timeline

```text
✓ Trip identified
✓ Flight inventory searched
✓ Airport inventory searched
✓ Possible matches found
✓ Candidate evaluated
● Ownership verification
○ Recovery authorization
○ Collection
```

The timeline should update when WebMCP tools modify the case.

---

# 19. AGENT ACTIVITY PANEL

Include a small section on the existing recovery page.

This is NOT an agent dashboard.

It is normal application activity.

Example:

```text
Investigation activity

✓ Recovery case created
✓ Flight AO-123 identified
✓ Aircraft inventory searched
✓ Delhi airport inventory searched

2 possible matches found

✕ Candidate #1 rejected
  Flight mismatch

◉ Candidate #2 under investigation

✓ Flight matches
✓ Date matches
✓ Location matches

Additional ownership evidence required
```

When a human performs equivalent actions manually, the same activity mechanism should be used.

---

# 20. MATCH COMPARISON UI

Display candidate cards.

Example:

```text
POSSIBLE MATCH

Black backpack
Found on AO-123
Delhi Airport
September 1

Match strength
75 — Strong candidate

✓ Flight
✓ Date
✓ Description
✓ Location

Additional ownership verification required
```

For rejected candidates:

```text
MATCH REJECTED

Black backpack

Reason:
Flight does not match your journey.
```

This makes the agent's investigation visible and understandable.

---

# 21. OWNERSHIP VERIFICATION UI

When evidence is required:

```text
Ownership verification

To protect your property, provide one identifying
detail that would not be visible in the public listing.

[ Your answer ]

[Verify ownership]
```

After success:

```text
OWNERSHIP VERIFIED

Evidence strength: 100

✓ Flight matches
✓ Date matches
✓ Location matches
✓ Description matches
✓ Private ownership evidence verified
```

Never display the hidden stored evidence.

---

# 22. RECOVERY AUTHORIZATION UI

Before authorization:

```text
Recovery ready

Your ownership has been verified.

Pickup:
Delhi Airport Lost & Found

Hours:
09:00–18:00

Final authorization required.

[Authorize recovery]
```

After authorization:

```text
RECOVERY AUTHORIZED

Your item is ready for collection.

Delhi Airport Lost & Found

Recovery #RC-10482
```

---

# 23. VISUAL DESIGN

The product should look like a credible modern travel operations product.

Style:

* clean
* professional
* calm
* trustworthy
* minimal
* generous whitespace
* strong typography
* subtle borders
* restrained blue accent
* off-white/light background
* dark navy text
* rounded cards
* clear status indicators

Avoid:

* giant AI robot graphics
* excessive gradients
* excessive glassmorphism
* "MAGIC AI" language
* unnecessary animations
* generic ChatGPT clone appearance
* neon cyberpunk aesthetics

The product should feel like something an airline could actually deploy.

---

# 24. TECH STACK

Recommended:

```text
Next.js
React
TypeScript
Tailwind CSS
Lucide icons
```

Backend:

```text
Next.js API routes
RecoveryService domain layer (shared by UI + WebMCP)
```

Database:

**Firebase Firestore** via Firebase Admin SDK on the server.

Collections:

* `flights`
* `foundItems` (public fields only)
* `foundItems/{id}/secrets/evidence` — private ownership clues (Admin SDK only)
* `recoveryCases`
* `activities`

If Firebase Admin credentials are not configured, the app falls back to an in-memory store with the same seed data (local demo / CI).

Do **not** use Supabase for this project.

Auth: no login for the hackathon demo — fixed `demo-passenger` context so judges can open the live URL in ChatGPT’s in-app browser with zero friction.

---

# 25. DATA MODEL

Create at least these entities.

## Flight

```text
id
flightNumber
date
origin
destination
departureTime
arrivalTime
aircraft
terminal
gate
```

## FoundItem

```text
id
description
brand
color
foundLocation
foundAt
flightNumber
flightDate
status
custodyDomain   // aircraft | airport_lnf | terminal_gate
custodyOwner
```

Private ownership clues are **not** stored on the public FoundItem document.

Store them only in:

```text
foundItems/{id}/secrets/evidence
  clues: string[]
```

Readable **only** by the Firebase Admin SDK / server domain layer.

`privateEvidence` must never be exposed through public item-detail tools, WebMCP responses, or client Firestore reads.

## RecoveryPacket

Prepared after ownership verification; required before authorization:

```text
caseId
foundItemId
itemSummary
custodyOwner
pickupLocation
pickupHours
instructions[]
preparedAt
```

## RecoveryCase

```text
id
passengerId
flightNumber
travelDate
origin
destination
itemDescription
lastKnownLocation
status
candidateIds
comparisons[]      // match reasoning artifacts
selectedFoundItemId
ownershipVerified
recoveryPrepared
recoveryAuthorized
recoveryPacket
createdAt
updatedAt
```

## Activity

```text
id
recoveryCaseId
type
message
meta
timestamp
actor            // human | agent | system
```

---

# 26. SEED DATA

Create realistic data.

At least:

### Flights

```text
AO-101 Mumbai → Bengaluru
AO-123 Mumbai → Delhi
AO-221 Delhi → Mumbai
AO-315 Mumbai → Hyderabad
AO-407 Delhi → Bengaluru
```

Include multiple dates.

### Found items

Create 30–50 realistic items.

Examples:

* black backpack
* blue earbuds case
* brown wallet
* grey jacket
* silver watch
* camera bag
* laptop sleeve
* Kindle
* black headphones
* passport holder
* water bottle
* sunglasses case

Most should be unrelated.

For the main scenario, create deliberate decoys.

---

# 27. MAIN SCENARIO SEED DATA

At minimum:

### FI-1001

```text
Black backpack
Flight AO-101
Found Mumbai Airport
Wrong flight
```

### FI-1002

```text
Black backpack
Flight AO-123
Found Delhi Airport Terminal 2
Partial match
```

### FI-1003

```text
Black backpack
Flight AO-123
Found on aircraft
September 1
Strong match
```

Private evidence:

```text
Small red keychain inside
Silver pen in front compartment
```

Only FI-1003 should fully verify when the user provides:

> "small red keychain"

---

# 28. AGENT ACTIVITY MUST BE REAL

Do not hard-code the UI to pretend the agent performed actions.

When a WebMCP tool executes:

1. service layer changes state
2. activity is recorded
3. UI reads the new state
4. UI updates

The demo should therefore reflect actual tool execution.

---

# 29. HUMAN UI AND WEBMCP PARITY

Every important WebMCP capability should have a corresponding human-facing action where appropriate.

Example:

```text
WebMCP:
search_found_items()

Human UI:
Search found items
```

```text
WebMCP:
verify_ownership()

Human UI:
Verify ownership
```

Both call the same service.

Some internal capabilities such as `compare_possible_match` may be automatically performed by the application and do not need a prominent button.

---

# 30. ERROR HANDLING

The system must handle:

* unknown flight
* no matching items
* ambiguous candidates
* insufficient ownership evidence
* already claimed item
* invalid recovery case
* unauthorized recovery authorization
* missing required fields

Example:

If evidence is wrong:

```text
Ownership could not be verified.

The supplied detail does not match the
private recovery evidence.

Please provide another identifying detail.
```

Do not reveal the correct answer.

---

# 31. IMPORTANT SECURITY RULE

Never expose private evidence through:

* `get_item_details`
* `search_found_items`
* frontend public item cards
* WebMCP descriptions
* browser-visible API responses

The private evidence exists specifically to demonstrate secure human-agent collaboration.

---

# 32. AGENT BEHAVIOR

The application should make it possible for the OpenAI agent to naturally perform multi-step reasoning.

If asked:

> "I lost my black backpack on AO-123 yesterday. I'm not sure whether it was on the aircraft or at the airport. Please investigate."

The agent should have enough tool descriptions and structured outputs to determine that it should:

```text
create case
↓
search relevant inventories
↓
inspect candidates
↓
compare candidates
↓
select strongest candidate
↓
request ownership evidence
↓
verify evidence
↓
prepare recovery
↓
ask human for authorization
↓
authorize after explicit confirmation
↓
report status
```

Do not require the user to manually tell the agent which tool to call.

The tools and descriptions should make the workflow discoverable.

---

# 33. TOOL DESCRIPTIONS

Tool descriptions must explain:

* what the tool does
* when it should be used
* important constraints
* what it returns

Descriptions should be written for an AI agent, not a developer.

Example:

```text
Search the airline's found-property inventory for items
that may correspond to a passenger's missing property.
Use this when investigating a recovery case. Results may
include multiple candidates and should be compared before
claiming ownership. Private ownership evidence is never
returned by this tool.
```

---

# 34. DO NOT BUILD

To preserve scope, DO NOT build:

* real airline integrations
* real airport integrations
* real AirTag integration
* payments
* shipping
* complex authentication
* mobile application
* multi-airline administration
* huge admin dashboard
* vector database
* RAG system
* LLM-powered fuzzy matching
* real customer PII
* email infrastructure
* SMS infrastructure
* complicated deployment infrastructure

The prototype should be self-contained and reliable.

---

# 35. OUT OF V1 — TRACKER FEATURE

Deferred. See §13. Do not build for the hackathon submission.

---

# 36. DEMO EXPERIENCE

The final demo should be optimized for an OpenAI desktop application with ClaimDesk opened in the ChatGPT in-app browser.

Do NOT require the judge to:

* open developer tools
* manually register tools
* understand JavaScript
* use a custom MCP client
* configure a complicated local environment

The live website should expose WebMCP automatically when loaded in a compatible environment.

---

# 37. DEMO SCRIPT

Target length:

**2–2.5 minutes**

Maximum:

**under 3 minutes**

### 0:00–0:15 — Problem

Show ClaimDesk.

Narration:

> "I lost my backpack after a flight. The problem isn't just finding it. I have to figure out where it went, determine which found item is mine, prove ownership, and coordinate recovery."

---

### 0:15–0:30 — Traditional UI

Briefly show the normal ClaimDesk experience.

Do not spend too long here.

Say:

> "A traditional website makes me drive the process."

---

### 0:30–1:25 — WebMCP

Open the application through the OpenAI desktop app/in-app browser.

Tell the agent:

> "I lost my black backpack on AO-123 yesterday. I'm not sure whether I left it on the aircraft or at the airport. Please investigate."

Agent operates tools.

Show the ClaimDesk UI changing.

Important visible sequence:

```text
Case created
↓
Flight identified
↓
Aircraft inventory searched
↓
Airport inventory searched
↓
Multiple candidates
↓
Wrong candidate rejected
↓
Strong candidate identified
```

---

### 1:25–1:50 — Ownership verification

Agent:

> "I found a strong match. To verify ownership, tell me one identifying detail inside the backpack that wouldn't be visible in the listing."

Human:

> "There was a small red keychain inside."

Agent verifies.

UI:

```text
OWNERSHIP VERIFIED
```

---

### 1:50–2:10 — Human authorization

Agent:

> "I've verified the item and prepared the recovery request. Final authorization is required. Would you like me to authorize recovery?"

Human:

> "Yes."

Agent calls authorization tool.

UI:

```text
RECOVERY AUTHORIZED
Ready for collection
Delhi Airport Lost & Found
```

---

### 2:10–2:25 — Closing

Narration:

> "ClaimDesk doesn't add an AI chatbot to lost-and-found. It exposes the actual recovery workflow as agent-accessible capabilities. The agent investigates the problem; the human stays in control of the consequential decision."

End screen:

**ClaimDesk**

**Lost after your flight. Matched, proven, ready for pickup.**

---

# 38. DEMO VIDEO REQUIREMENTS

The final demo video must:

* be under 3 minutes
* have clear audio
* explain what was built
* explain how WebMCP is used
* demonstrate the working application
* show actual agent interaction
* show human-agent collaboration

Do not spend the majority of the video explaining implementation details.

Show the product working.

---

# 39. ACCEPTANCE TEST — HUMAN

The following must work manually:

### Test 1

Create recovery case.

Expected:

Case appears on dashboard.

### Test 2

Search found items.

Expected:

Candidates appear.

### Test 3

Compare candidate.

Expected:

Deterministic score and reasons appear.

### Test 4

Enter valid private evidence.

Expected:

Ownership verified.

### Test 5

Prepare recovery.

Expected:

Recovery becomes ready for authorization.

### Test 6

Authorize recovery.

Expected:

Status becomes authorized/ready for collection.

---

# 40. ACCEPTANCE TEST — WEBMCP

Using a compatible OpenAI agent:

### Test 1

Agent can discover tools.

### Test 2

Agent can create case.

### Test 3

Agent can search.

### Test 4

Agent can inspect candidates.

### Test 5

Agent can compare candidates.

### Test 6

Agent can request ownership evidence.

### Test 7

Agent can verify evidence.

### Test 8

Agent can prepare recovery.

### Test 9

Agent cannot bypass human authorization.

### Test 10

After explicit human approval, agent can authorize recovery.

### Test 11

Agent can retrieve final recovery status.

---

# 41. ACCEPTANCE TEST — SHARED STATE

This is critical.

### Scenario

1. Human creates a case.
2. Agent opens/investigates the same case.
3. Agent changes the state.
4. Human UI reflects those changes.

Then reverse:

1. Agent creates a case.
2. Human opens it.
3. Human performs an action.
4. Agent can retrieve the updated state.

If this works, the architecture is correct.

---

# 42. ACCEPTANCE TEST — SECURITY

Verify:

* private evidence is never returned by public item search
* private evidence is never displayed in candidate cards
* wrong evidence does not reveal the correct evidence
* recovery cannot be authorized without explicit human approval
* tracker location cannot be shared without approval
* fake PII is not used

---

# 43. SUCCESS CRITERIA

The finished project should feel like:

> A real airline lost-property product that happens to be exceptionally well designed for AI agents.

It should NOT feel like:

> A WebMCP technical demo with a lost-and-found theme.

---

# 44. JUDGING STRATEGY

## WebMCP Leverage

Target:

**9–10/10**

Demonstrate:

* many meaningful tools
* structured schemas
* semantic business capabilities
* multi-step tool composition
* shared service layer
* human approval boundary
* actual state changes
* no click simulation

---

## Execution

Target:

**9–10/10**

Demonstrate:

* polished interface
* complete recovery lifecycle
* reliable seeded data
* realistic states
* error handling
* human workflow
* agent workflow
* no broken demo paths

---

## Potential Impact

Target:

**9/10**

Position ClaimDesk as an agent-native layer for fragmented airline/airport lost-property workflows.

The problem is:

> Passengers should not need to understand the organization's internal workflow in order to recover their property.

The agent handles the complexity.

The passenger provides information and makes consequential decisions.

---

## Creativity & Ambition

Target:

**9/10**

Do NOT pitch:

> "AI-powered lost and found."

Pitch:

> "An agent-native recovery system that investigates lost property across airline and airport inventory and verifies ownership using evidence the public listing does not reveal."

The combination of:

* investigation
* cross-location search
* candidate elimination
* private evidence
* human authorization
* WebMCP-native capabilities

is the differentiating story.

---

# 45. PRODUCT PHILOSOPHY

The central idea of ClaimDesk is:

> **Today's websites expose pages. ClaimDesk exposes capabilities.**

Traditional interface:

```text
Find page
→ find form
→ fill form
→ search
→ inspect results
→ submit claim
→ wait
```

Agent-native interface:

```text
Tell ClaimDesk what happened
→ agent investigates
→ agent compares evidence
→ agent asks what only you know
→ agent prepares recovery
→ you authorize
```

This is the core WebMCP story.

---

# 46. IMPLEMENTATION PRIORITY

Build in this exact order.

## P0 — Must work

1. Project setup
2. Database/state
3. Seed data
4. Recovery service layer
5. Dashboard
6. Recovery case page
7. Search
8. Candidate comparison
9. Ownership verification
10. Recovery authorization
11. WebMCP registration
12. WebMCP tools
13. OpenAI agent end-to-end test

## P1 — Polish

14. Activity timeline
15. Better candidate cards
16. Loading/error states
17. Empty states
18. Responsive design
19. Visual polish
20. Demo preparation

## P2 — Out of v1

21. Tracker scenario (deferred)
22. Additional flights beyond seed set
23. Additional recovery states beyond the status machine

Do NOT start P2 until P0 and P1 are reliable.

---

# 47. FINAL IMPLEMENTATION RULE

Before declaring the project complete, verify this exact sentence:

> **"A human can use ClaimDesk normally, and an OpenAI agent can operate the same ClaimDesk application through WebMCP without requiring a separate agent UI."**

If this is true, the architecture is correct.

If the agent requires a special frontend, redesign it.

If WebMCP tools merely simulate clicks, redesign them.

If the UI pretends actions happened without actual state changes, redesign it.

If the agent can authorize valuable property without human approval, redesign it.

---

# 48. FINAL PRODUCT DEFINITION

ClaimDesk is not an AI chatbot.

ClaimDesk is not a lost-and-found form.

ClaimDesk is not an MCP showcase.

ClaimDesk is:

> **An agent-native airline lost-property recovery application where humans describe what happened and AI agents investigate, verify and coordinate recovery using structured WebMCP capabilities—with the human retaining control over consequential actions.**

Build the smallest polished version of that idea.

Prioritize reliability, realism, clear agent capability boundaries, and an exceptional end-to-end demo over feature count.
