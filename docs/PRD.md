# OSS402 — Product Requirements Document

**Status:** Hackathon MVP  
**Target:** Stellar Odyssey Perú 2026  
**Primary Track:** AI Agents & Automated Workflows  
**MVP Scope:** 2–4 days  
**Network:** Stellar Testnet  
**Payment Model:** Pay-per-job via x402  
**Settlement Asset:** USDC-compatible test asset  
**Working Name:** OSS402

---

## 1. Product Vision

AI coding agents increasingly consume open-source software while bypassing many of the websites, documentation funnels, sponsorship pages, and commercial surfaces that historically helped sustain maintainers.

Traditional flow:

```text
Developer
   ↓
Google / Docs
   ↓
Open Source Project
   ↓
Commercial surface / Sponsors / Paid service
```

Agentic flow:

```text
Developer
   ↓
AI Coding Agent
   ↓
Model knowledge + docs + source code
   ↓
Working software
```

The OSS project still creates value, but the maintainer can disappear from the economic interaction.

OSS402 introduces a machine-native monetization layer where maintainers can offer **optional, paid, maintainer-backed services or artifacts** that an AI agent can discover, economically evaluate, purchase via x402 on Stellar, consume, and continue working without human intervention.

> **Open source stays free. AI agents can pay maintainers when buying official maintainer work is more rational than recreating it themselves.**

---

## 2. Core Principle

OSS402 must **not** put open-source software behind a paywall.

These remain free:

- Source code
- Public documentation
- Stable releases
- GitHub repositories
- Normal package installation
- Community knowledge
- Public migration guides

Maintainers monetize **additional machine-consumable work**.

Possible paid resources:

- Official compatibility artifacts
- Priority compatibility builds
- Backported fixes
- Migration artifacts
- Early compatibility releases
- Signed release artifacts
- Maintainer-tested patches
- Specialized compatibility reports
- Priority security artifacts
- Official machine-readable support services

For the MVP, implement exactly one monetizable resource:

> **Official Compatibility Artifact**

---

## 3. MVP Story

Create a fictional but functional open-source package:

```text
fastjson-x
```

Current public release:

```text
fastjson-x v2.0
```

An example application uses:

```text
Node.js 28
fastjson-x v2.0
```

There is intentionally a compatibility issue.

Example failing test:

```text
FAIL

fastjson-x v2.0 is incompatible
with Node.js 28 serialization behavior.
```

The AI coding agent investigates and discovers two paths.

### Option A — Solve independently

```text
Implement compatibility patch manually

Estimated effort:
~15–20 minutes

Expected compute/tool cost:
Higher than purchasing official artifact

Risk:
Medium

Requires:
- source inspection
- patch generation
- testing
- debugging
```

### Option B — Buy official maintainer artifact

OSS402 exposes:

```text
Official Node.js 28 Compatibility Artifact

Maintainer:
FastJSON Maintainers

Price:
0.05 USDC

Includes:
- compatibility.patch
- manifest.json
- compatibility-report.md
- maintainer-backed artifact metadata

Expected result:
Node.js 28 compatibility
```

The agent reasons:

```text
Official artifact: $0.05
Self-solving requires more time, compute and uncertainty.

Decision:
BUY
```

The agent pays through Stellar x402, the artifact is unlocked, the agent applies it, and the tests pass:

```text
42 passed
0 failed
```

Maintainer dashboard:

```text
AI purchases: 1
Revenue: +0.05 USDC
```

---

## 4. Core Wow Moment

The primary demo must visibly show:

```text
Tests FAIL
      ↓
Agent discovers official fix
      ↓
Agent compares:

BUILD MYSELF
vs
BUY FOR $0.05

      ↓
Agent decides BUY
      ↓
HTTP 402 Payment Required
      ↓
0.05 USDC settled on Stellar
      ↓
Artifact unlocked
      ↓
Agent applies artifact
      ↓
Tests PASS
      ↓
Maintainer receives payment
```

The user must **not** manually click a Buy button during the main flow.

The agent itself must decide that buying is economically preferable.

---

## 5. Personas

### 5.1 OSS Maintainer

Goals:

- Keep core OSS freely available
- Monetize high-value maintenance work
- Receive direct USDC payments
- Offer machine-readable services
- Avoid building a full SaaS billing stack

Can publish resources such as compatibility artifacts, priority builds, backports, migration packs, or signed releases.

### 5.2 AI Coding Agent

Examples: Codex, Claude Code, OpenCode, other MCP-capable agents.

Responsibilities:

1. Detect a software problem.
2. Investigate normal free options first.
3. Discover OSS402 services.
4. Inspect price and expected value.
5. Estimate self-solving effort/cost/risk.
6. Compare both options.
7. Check spending policy.
8. Purchase if rational.
9. Consume artifact.
10. Continue coding autonomously.

### 5.3 Developer

Provides the agent with a spending policy.

```text
Session budget:
1.00 USDC

Maximum autonomous purchase:
0.10 USDC

Allowed:
✓ OSS maintainer services
✓ Compatibility artifacts
✓ Migration artifacts

Approval required:
> 0.10 USDC
```

For the MVP, the developer should not approve the 0.05 USDC purchase manually.

---

## 6. Economic Decision Model

The agent explicitly compares two estimated costs.

### Self-solve estimate

Inputs can include:

- Estimated execution time
- Expected token/compute cost
- Number of files likely to change
- Test complexity
- Regression risk
- Confidence level
- Whether an official solution exists

Example:

```json
{
  "estimated_minutes": 18,
  "estimated_compute_usd": 0.21,
  "risk": "medium",
  "confidence": 0.72
}
```

### Purchase estimate

```json
{
  "price_usdc": 0.05,
  "publisher": "FastJSON Maintainers",
  "official": true,
  "target_runtime": "Node.js 28",
  "expected_confidence": 0.98
}
```

### MVP decision rule

```text
BUY if:

resource.price <= autonomous_limit

AND

(
  estimated_self_solve_cost > resource.price
  OR self_solve_risk >= medium
  OR official_resource_confidence significantly exceeds self-solve confidence
)
```

The agent should explain its decision briefly in natural language.

---

## 7. High-Level Architecture

```text
┌──────────────────────────┐
│      Coding Agent        │
│ Codex / Claude / etc.    │
└────────────┬─────────────┘
             │ MCP
             ▼
┌──────────────────────────┐
│        OSS402 MCP        │
│                          │
│ discover_services        │
│ inspect_service          │
│ purchase_resource        │
│ wallet_balance           │
│ check_budget             │
└────────────┬─────────────┘
             │ HTTP
             ▼
┌──────────────────────────┐
│       OSS402 Server      │
│                          │
│ Project registry         │
│ Service catalog          │
│ Protected artifacts      │
│ Purchase records         │
└────────────┬─────────────┘
             │ 402
             ▼
┌──────────────────────────┐
│      Stellar x402        │
│                          │
│ USDC authorization       │
│ Verification             │
│ Settlement               │
└────────────┬─────────────┘
             │
             ▼
       Maintainer Wallet
```

---

## 8. Maintainer Manifest

Each participating OSS project exposes a machine-readable manifest.

Suggested path:

```text
/.well-known/oss402.json
```

Example:

```json
{
  "schemaVersion": "0.1",
  "project": {
    "name": "fastjson-x",
    "repository": "https://github.com/demo/fastjson-x",
    "package": "fastjson-x"
  },
  "maintainer": {
    "name": "FastJSON Maintainers",
    "stellarAddress": "G..."
  },
  "services": [
    {
      "id": "node28-compatibility",
      "type": "compatibility_artifact",
      "title": "Official Node.js 28 Compatibility Artifact",
      "description": "Maintainer-tested compatibility patch for fastjson-x v2.0 on Node.js 28.",
      "price": {
        "amount": "0.05",
        "currency": "USDC",
        "network": "stellar-testnet"
      },
      "endpoint": "/api/resources/node28-compatibility",
      "compatibleWith": {
        "package": "fastjson-x",
        "packageVersion": "2.0.0",
        "runtime": "node",
        "runtimeVersion": "28"
      }
    }
  ]
}
```

Do not over-engineer this schema for the MVP.

---

## 9. MCP Tools

### `discover_services`

Input:

```json
{
  "project": "fastjson-x"
}
```

Output:

```json
{
  "services": [
    {
      "id": "node28-compatibility",
      "title": "Official Node.js 28 Compatibility Artifact",
      "price": "0.05 USDC"
    }
  ]
}
```

### `inspect_service`

```json
{
  "serviceId": "node28-compatibility"
}
```

Returns price, target versions, artifact type, publisher, and expected outcome.

### `wallet_balance`

```json
{
  "balance": "1.00",
  "currency": "USDC"
}
```

### `check_budget`

Input:

```json
{
  "amount": "0.05"
}
```

Output:

```json
{
  "allowed": true,
  "remainingAfterPurchase": "0.95"
}
```

### `purchase_resource`

Input:

```json
{
  "serviceId": "node28-compatibility"
}
```

Behavior:

1. Request protected resource.
2. Receive HTTP 402.
3. Build/sign Stellar x402 payment.
4. Retry with payment proof.
5. Receive protected artifact.
6. Save locally.
7. Return payment and artifact metadata.

Example output:

```json
{
  "success": true,
  "paid": "0.05 USDC",
  "transaction": "stellar_tx_hash",
  "artifactPath": "./.oss402/node28-compatibility/"
}
```

---

## 10. Protected Resource Endpoint

```http
GET /api/resources/node28-compatibility
```

Without payment:

```http
HTTP/1.1 402 Payment Required
```

After valid payment:

```http
HTTP/1.1 200 OK
```

Example response:

```json
{
  "resourceId": "node28-compatibility",
  "project": "fastjson-x",
  "version": "1",
  "artifactUrl": "...",
  "artifactHash": "...",
  "maintainer": "G...",
  "paymentTx": "..."
}
```

---

## 11. Artifact Structure

```text
fastjson-node28-compat/
│
├── compatibility.patch
├── manifest.json
└── compatibility-report.md
```

Example `manifest.json`:

```json
{
  "project": "fastjson-x",
  "publicVersion": "2.0.0",
  "targetEnvironment": {
    "runtime": "node",
    "runtimeVersion": "28"
  },
  "artifactType": "official_compatibility_patch",
  "publisher": "FastJSON Maintainers",
  "artifactHash": "sha256:...",
  "createdAt": "2026-09-23T00:00:00Z"
}
```

---

## 12. Suggested Repository Structure

```text
oss402/
│
├── apps/
│   ├── maintainer-dashboard/
│   ├── demo-broken-app/
│   └── oss402-api/
│
├── packages/
│   ├── fastjson-x/
│   ├── fastjson-x-node28-artifact/
│   ├── oss402-mcp/
│   └── oss402-client/
│
├── contracts/
│   └── optional-budget-policy/
│
├── demo/
│   ├── DEMO_SCRIPT.md
│   └── prompts/
│
└── README.md
```

---

## 13. Maintainer Dashboard

Required:

```text
OSS402

fastjson-x

Revenue
0.05 USDC

AI consumers
1

Services

Node 28 Compatibility Artifact
0.05 USDC
1 purchase
```

Optional:

- Revenue chart
- Wallet balance
- Resource popularity
- Recent transactions

Do not over-invest in analytics during the hackathon.

---

## 14. Agent Wallet and Guardrails

Minimum viable policy can live in the MCP layer.

Example:

```json
{
  "sessionBudget": 1.0,
  "maxAutonomousPurchase": 0.1,
  "allowedCategories": [
    "compatibility_artifact",
    "migration_artifact"
  ]
}
```

Purchase below limit:

```text
Resource: $0.05
Limit: $0.10

APPROVED
```

Purchase above limit:

```text
Resource: $3.00
Limit: $0.10

DENIED

Reason:
Autonomous spending limit exceeded.
Human approval required.
```

Stretch goal: enforce limits using Stellar smart-account policies.

---

## 15. Demo Flow

### Step 1 — Start with broken software

Prompt:

> Fix this project and make all tests pass. You may autonomously purchase official OSS maintainer resources costing up to 0.10 USDC if doing so is more efficient than solving the issue yourself.

Agent runs:

```bash
npm test
```

Result:

```text
41 passed
1 failed
```

### Step 2 — Agent investigates

Determines:

```text
fastjson-x v2.0
+
Node.js 28
=
compatibility issue
```

### Step 3 — Discover OSS402 resource

```text
discover_services("fastjson-x")
```

Finds:

```text
Official Node.js 28 Compatibility Artifact
0.05 USDC
```

### Step 4 — Economic reasoning

Agent visibly explains:

```text
I can attempt to reconstruct the compatibility fix manually.

Estimated self-solving cost:
~$0.20–$0.30 of agent/tool usage
with moderate compatibility risk.

Official maintainer artifact:
$0.05 USDC
within my $0.10 autonomous purchase limit.

Buying is the lower-cost, lower-risk option.

Decision: purchase.
```

### Step 5 — x402 payment

```text
GET /api/resources/node28-compatibility
```

Server:

```text
402 Payment Required
```

Agent pays:

```text
0.05 USDC
Agent Wallet → Maintainer Wallet
```

Show Stellar transaction hash.

### Step 6 — Artifact delivery

```text
200 OK
```

Artifact is saved locally.

### Step 7 — Apply artifact

```bash
git apply compatibility.patch
```

### Step 8 — Tests pass

```text
42 passed
0 failed
```

### Step 9 — Maintainer gets paid

```text
AI consumers: 1
Revenue: +0.05 USDC
```

End demo.

---

## 16. Demo Timing

Target: ~90 seconds.

```text
0:00–0:10
Explain OSS sustainability problem

0:10–0:20
Agent runs tests → FAIL

0:20–0:35
Agent discovers official maintainer resource

0:35–0:50
Agent compares self-solving vs buying

0:50–1:05
x402 payment on Stellar

1:05–1:20
Artifact applied

1:20–1:30
Tests PASS + maintainer receives revenue
```

---

## 17. Product Positioning

Do **not** pitch:

- “A marketplace for paid open-source packages.”
- “Paywall for OSS.”
- “Crypto donations for maintainers.”
- “Paid documentation.”

Pitch:

> **Machine-native monetization for open-source maintainers.**

Supporting line:

> **AI uses upstream. AI pays upstream.**

Longer explanation:

> OSS402 lets maintainers keep source, docs and stable releases free while exposing optional machine-readable services and artifacts. Coding agents can discover those resources, compare their cost against solving the problem themselves, and autonomously purchase them through x402 on Stellar when buying is the rational choice.

---

## 18. Why x402

Traditional checkout:

```text
Agent
↓
Open browser
↓
Create account
↓
Stripe checkout
↓
Card / email / API key
↓
Return to task
```

OSS402:

```text
Agent
↓
HTTP request
↓
402
↓
USDC payment
↓
200
↓
continue task
```

The buyer is a machine, so payment should also be machine-native.

---

## 19. Why Stellar

Stellar is used for the actual economic interaction, not decorative storage.

Core responsibilities:

- Machine-native USDC settlement
- x402 payment flow
- Direct maintainer payout
- Low-cost small payments
- Verifiable payment receipt
- Future smart-account spending policies
- Future revenue splitting across upstream maintainers

If Stellar/x402 is removed, the core autonomous machine-purchase flow changes materially.

---

## 20. Why Pay-Per-Job

The MVP uses:

> **pay-per-job**

Not:

- Monthly subscription
- Paid access to source
- Paid documentation
- Per-install pricing

Reasons:

1. Agents consume resources opportunistically.
2. A developer may need a resource only once.
3. x402 naturally supports request-level payment.
4. It avoids SaaS subscription fatigue.
5. Price can be compared directly against agent compute/time cost.
6. It creates a clear machine-economic decision.

Enterprise subscriptions can be added later.

---

## 21. Future Resource Types

### Compatibility

```text
node28-compatibility
python314-compatibility
next18-compatibility
```

### Migration

```text
v3-to-v4 migration artifact
database schema migration
framework upgrade bundle
```

### Priority releases

```text
early compatibility build
release candidate access
priority backport
```

### Security

```text
maintainer-backed security patch
early advisory
signed security artifact
```

### Official builds

```text
signed binary
reproducible build
SBOM
compatibility attestation
```

### Support

```text
machine-readable support request
maintainer review
official diagnosis
```

---

## 22. Future Upstream Revenue Sharing

Not required for MVP.

Future possibility:

```text
Framework A
     ↓ depends on
Library B
     ↓ depends on
Library C
```

A paid operation on Framework A could allocate part of its revenue upstream:

```text
0.10 USDC

0.07 → Framework A
0.02 → Library B
0.01 → Library C
```

Do not implement this until the core loop is stable.

---

## 23. Non-Goals

Do NOT build:

- A replacement for npm
- A generic package marketplace
- A GitHub clone
- A sponsorship platform
- A paid documentation platform
- A token for OSS maintainers
- An NFT system
- Full dependency revenue sharing
- Complex DAO governance
- A production licensing platform
- Full enterprise billing
- Mainnet-first deployment

Stay focused on the single agent-purchase loop.

---

## 24. MVP Acceptance Criteria

The MVP is successful if:

- [ ] Functional OSS demo package exists
- [ ] Demo application has an intentional compatibility failure
- [ ] OSS402 manifest is discoverable
- [ ] MCP server exposes paid maintainer service
- [ ] Coding agent can discover the service
- [ ] Agent can inspect price and metadata
- [ ] Agent explicitly compares self-solving vs buying
- [ ] Agent has an autonomous spending limit
- [ ] Agent chooses to buy without human confirmation
- [ ] Protected endpoint returns HTTP 402
- [ ] Agent completes an x402 payment on Stellar Testnet
- [ ] Maintainer wallet receives payment
- [ ] Paid resource becomes accessible
- [ ] Agent downloads resource
- [ ] Agent applies compatibility artifact
- [ ] Tests change from FAIL to PASS
- [ ] Maintainer dashboard reflects purchase
- [ ] Stellar transaction hash is visible in the demo

If these work reliably, stop adding features and prepare the pitch.

---

## 25. Suggested Tech Stack

### Frontend

```text
Next.js / React
Tailwind CSS
shadcn/ui
```

### Backend

```text
Node.js
TypeScript
Fastify / Express / Next API routes
```

### Agent Integration

```text
MCP server
TypeScript SDK
```

### Payments

```text
Stellar Testnet
x402
USDC-compatible test asset
OpenZeppelin/Stellar facilitator where appropriate
```

### Persistence

```text
SQLite
or
PostgreSQL
```

Store only project metadata, resource catalog, purchase metadata and transaction hashes.

---

## 26. README Narrative

### Problem

AI increasingly consumes OSS while bypassing economic funnels that historically helped sustain maintainers.

### Insight

Do not charge agents for information they can reconstruct from public source and documentation.

Charge for:

> **Maintainer-backed work that is cheaper, faster, safer or more authoritative to buy than recreate.**

### Solution

OSS402 creates machine-readable paid maintainer services.

### Core Example

```text
Coding Agent
↓
dependency problem
↓
official fix available
↓
compare build vs buy
↓
buy wins
↓
x402 payment
↓
maintainer paid
↓
agent continues
```

### Principle

> **Open source stays free. Maintenance work becomes machine-buyable.**

---

## 27. Demo Prompt

```text
Fix this repository until all tests pass.

You have access to OSS402 maintainer services through MCP.

You may autonomously purchase official maintainer resources costing
up to 0.10 USDC each, with a total session budget of 1 USDC.

Before purchasing anything:

1. Inspect the problem.
2. Estimate the effort, cost and risk of solving it yourself.
3. Inspect available maintainer resources.
4. Compare both options.
5. Purchase only when the paid resource is economically preferable.
6. Explain your decision briefly.
7. Continue working until all tests pass.
```

---

## 28. Stretch Goals

Only after the core demo is stable:

1. Stellar smart-account spending limits
2. Multiple OSS services
3. Early-access compatibility channel
4. Signed artifact verification
5. Maintainer identity verification
6. Automatic revenue split to upstream dependencies
7. Real GitHub repository integration
8. npm metadata discovery
9. Production USDC/Mainnet support
10. Generic OSS402 client SDK

---

## 29. One-Sentence Pitch

> **OSS402 turns AI agents into paying customers of the open-source maintainers they depend on.**

---

## 30. Tagline

> **AI uses upstream. AI pays upstream.**

---

## 31. Product Thesis

AI should not be forced to pay for knowledge it can obtain from public source code, documentation or reasoning.

Instead, OSS402 creates a market for the things maintainers uniquely provide:

- timely fixes,
- official artifacts,
- compatibility work,
- early support,
- signed releases,
- authority,
- maintenance.

The agent remains free to solve the problem itself.

The product works when the agent independently concludes:

> **“Buying from the maintainer is cheaper than rebuilding this myself.”**

That moment is the core of OSS402.
