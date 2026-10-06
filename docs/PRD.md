# PRD — OSS402

**Status:** Hackathon MVP  
**Event:** Stellar Odyssey Perú 2026  
**Primary Track:** AI Agents & Automated Workflows  
**Working Name:** OSS402  
**Demo Library:** `odyssey-auth`  
**Network:** Stellar Testnet  
**Payment Protocol:** x402  
**Payment Model:** Pay-per-certification-run  
**Repository Strategy:** Single monorepo  

Operational documentation lives under `docs/` and is indexed from the root README. This file remains the product specification. `docs/archive/PRD-v1.md` is the previous checkpoint.

---

# 1. Executive Summary

OSS402 is a machine-native certification protocol for open-source software.

The core idea is simple:

> **AI agents can pay open-source maintainers for official conformance testing of the exact project build they are working on.**

Open-source code remains free.

Documentation remains free.

Stable releases remain free.

The maintainer monetizes something that cannot be trivially copied or recreated:

> **their authority to define and execute the official conformance suite for their own library, and to attest that a specific project build passed it.**

An AI coding agent can:

1. detect that a project uses an OSS dependency,
2. detect that official maintainer certification is required before production,
3. discover the certification service,
4. check the price,
5. compare it against its autonomous spending policy,
6. pay via x402 on Stellar,
7. trigger the official conformance suite,
8. receive PASS or FAIL,
9. and, only after PASS, receive a version-bound maintainer attestation on Stellar.

The resulting attestation is linked to the exact:

- repository,
- commit,
- workspace,
- dependency version,
- conformance suite version,
- and build/configuration hash.

A README badge may then point to the public verification page.

---

# 2. Product Thesis

AI agents increasingly consume open-source software while bypassing many of the economic surfaces that traditionally supported maintainers.

OSS402 does **not** attempt to charge agents for:

- source code,
- docs,
- package installation,
- public knowledge,
- or answers an advanced model can derive itself.

Instead, OSS402 monetizes:

> **Official maintainer-backed conformance testing.**

The value is not:

> “the AI cannot test this itself.”

The value is:

> “the AI cannot truthfully claim that the official maintainer certified this exact project build unless that certification actually happened.”

---

# 3. MVP Goal

The MVP must demonstrate one complete end-to-end flow:

```text
AI Agent
   ↓
detects odyssey-auth
   ↓
reads project OSS402 policy
   ↓
discovers official certification
   ↓
pays certification run via x402
   ↓
official conformance suite executes
   ↓
PASS or FAIL
   ↓
if PASS:
maintainer attestation written to Stellar
   ↓
README badge / verification page
```

The MVP must use:

- one OSS library,
- one reusable conformance suite,
- two demo applications,
- one agent skill,
- one MCP server,
- one x402 payment flow,
- one GitHub Actions certification workflow,
- one Stellar attestation mechanism,
- one simple verification UI.

---

# 4. Non-Goals

Do **not** build the following during the hackathon:

- a generic npm marketplace,
- hundreds of OSS integrations,
- a GitHub clone,
- subscriptions,
- NFT certificates,
- tokenomics,
- DAOs,
- a sponsorship platform,
- a paid documentation platform,
- confidential computing / TEE,
- a production enterprise security platform,
- GitLab/Bitbucket support,
- universal CI support,
- arbitrary certification for any npm package,
- a complex licensing system,
- mainnet-first deployment,
- multi-chain support.

The MVP exists to prove the protocol.

---

# 5. Core Demo Library — `odyssey-auth`

Create a fictional but functional open-source authentication library:

```text
odyssey-auth
```

Its purpose is to provide enough meaningful behavior for an official conformance suite.

Suggested capabilities:

- authentication middleware,
- token validation,
- token expiry checks,
- role-based authorization,
- protected routes,
- admin-only routes,
- malformed token rejection.

Example API:

```ts
import { odysseyAuth } from "odyssey-auth";

const auth = odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: true,
  enforceRoles: true
});
```

The implementation does not need to be production-grade security software.

It only needs to be realistic enough to make conformance testing understandable.

---

# 6. Two Demo Applications

The monorepo must contain **two nearly identical applications**.

This is intentional.

The goal is to make the demo deterministic and reproducible without manually breaking/fixing code during the presentation.

## 6.1 `demo-valid`

Correctly configured.

Example:

```ts
odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: true,
  enforceRoles: true
});
```

Expected official certification result:

```text
PASS
```

## 6.2 `demo-invalid`

Nearly identical to `demo-valid`, but with one deliberate integration/configuration error.

Example:

```ts
odysseyAuth({
  issuer: "oss402-demo",

  // Intentionally wrong for the demo.
  rejectExpiredTokens: false,

  enforceRoles: true
});
```

Normal application tests should still pass.

Example:

```text
Unit tests        PASS
Build             PASS
Lint              PASS
```

But the official `odyssey-auth` conformance suite must detect the issue.

Expected result:

```text
FAIL

AUTH-017:
Expired token was accepted.
```

This demonstrates:

> Payment does not buy a certificate.

It buys a certification run.

---

# 7. Why Two Apps Matter

Both demo apps must:

- live in the same monorepo,
- use the same `odyssey-auth` package,
- use the same conformance suite,
- use the same workflow,
- use the same certification endpoint.

The only meaningful difference is the integration/configuration.

Expected outcome:

```text
apps/demo-invalid → FAIL
apps/demo-valid   → PASS
```

This proves that the suite is evaluating the project rather than returning a hardcoded success result.

---

# 8. Repository Structure

Use a single monorepo.

Suggested structure:

```text
oss402/
│
├── apps/
│   ├── demo-valid/
│   │   ├── src/
│   │   ├── oss402.yml
│   │   └── README.md
│   │
│   ├── demo-invalid/
│   │   ├── src/
│   │   ├── oss402.yml
│   │   └── README.md
│   │
│   ├── oss402-api/
│   │   └── x402 + certification orchestration
│   │
│   └── dashboard/
│       └── verification + maintainer revenue UI
│
├── packages/
│   ├── odyssey-auth/
│   │   └── OSS demo library
│   │
│   ├── odyssey-auth-conformance/
│   │   ├── manifest.json
│   │   ├── public-tests/
│   │   ├── private-tests/
│   │   ├── generators/
│   │   └── runner/
│   │
│   ├── oss402-client/
│   │
│   └── oss402-mcp/
│
├── contracts/
│   └── oss402-attestation/
│
├── .github/
│   └── workflows/
│       └── oss402-certification.yml
│
├── .agents/
│   └── skills/
│       └── oss402-certification/
│           └── SKILL.md
│
├── demo/
│   └── expected-results/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── GETTING_STARTED.md
│   ├── CONFIGURATION.md
│   ├── MCP_AND_AGENT_SKILL.md
│   ├── X402_STELLAR.md
│   ├── OPERATIONS.md
│   ├── TESTING.md
│   ├── SECURITY.md
│   └── PRD.md
│
├── AGENTS.md
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

Use `pnpm` workspaces unless there is a strong technical reason not to.

---

# 9. Conformance Suite

The official maintainer suite is the core value-producing resource.

The suite should be:

> **Static in specification, dynamic in execution.**

The maintainer defines once what correct use of `odyssey-auth` means.

The same specification must then be reusable across multiple consuming projects.

---

# 10. Conformance Categories

For the MVP, include approximately:

```text
10 public tests
15 private/dynamic tests
5 generated/fuzz/security cases
```

Total target:

```text
~30 checks
```

The exact number is not important.

The important point is that the suite feels meaningfully stronger than the consuming application's normal tests.

Suggested checks:

### Authentication

- valid token accepted,
- missing token rejected,
- malformed token rejected,
- expired token rejected,
- modified signature rejected.

### Authorization

- `user` can access user route,
- `user` cannot access admin route,
- `admin` can access admin route.

### Configuration

- insecure options rejected in production mode,
- required issuer is configured,
- expected middleware is active.

### Runtime behavior

- malformed auth input does not crash the app,
- logout/session invalidation works,
- protected resource rejects invalid auth state.

### Dynamic / generated checks

- mutate valid tokens,
- generate expired tokens,
- generate malformed claims,
- vary role combinations,
- vary request ordering.

---

# 11. Project Adapter Contract

The suite must not depend on one fixed project architecture.

Each consuming app must include:

```text
oss402.yml
```

Example:

```yaml
project:
  id: demo-valid

runtime:
  install: pnpm install --frozen-lockfile
  build: pnpm build
  start: pnpm start
  port: 3000

dependency:
  name: odyssey-auth
  version: 1.0.0

conformance:
  baseUrl: http://localhost:3000

  mappings:
    login: /api/login
    protected: /api/profile
    admin: /api/admin
```

The conformance runner uses these mappings instead of assuming route names.

This is the core mechanism that makes the suite reusable.

---

# 12. Agent Trigger

Do not rely on the model “remembering” that certification exists.

The trigger must be explicit.

Each demo project must include policy in `oss402.yml`.

Example:

```yaml
project:
  id: demo-valid

environment:
  target: production

certification:
  requiredFor:
    - production

dependencies:
  odyssey-auth:
    certification: required

agent:
  totalBudgetUSDC: 1.00
  maxAutonomousPurchaseUSDC: 0.10
```

The intended agent flow is:

```text
User says:
"Leave this project ready for production."

            ↓

Agent reads oss402.yml

            ↓

Production requires:
odyssey-auth official conformance

            ↓

Current commit has no valid attestation

            ↓

Discover certification service
```

---

# 13. Agent Skill

Create:

```text
.agents/skills/oss402-certification/SKILL.md
```

The skill teaches the coding agent how to use OSS402.

It must not contain a hardcoded instruction to always purchase certification.

It must explain the protocol.

Suggested contents:

```md
# OSS402 Certification Skill

Use this workflow when a project declares an OSS402
certification requirement.

1. Finish normal implementation work.
2. Run the project's own tests.
3. Read oss402.yml.
4. Detect whether the target environment requires official conformance.
5. Detect whether a valid attestation already exists for the current workspace/commit.
6. Discover available maintainer certification services.
7. Inspect price, suite version and dependency compatibility.
8. Check the project's autonomous procurement policy.
9. If the certification is required and the price is within policy,
   purchase the certification run.
10. Never interpret payment as proof of certification.
11. Wait for PASS or FAIL.
12. On FAIL:
    - read the conformance report,
    - explain the problem,
    - propose or implement a fix when allowed.
13. On PASS:
    - verify the attestation,
    - offer to add/update the README badge.
14. Never claim a different commit/workspace is certified.
```

---

# 14. MCP Server

Create a minimal OSS402 MCP server.

Required tools:

```text
oss402_discover
oss402_inspect
oss402_purchase_certification
oss402_certification_status
oss402_verify_attestation
```

---

# 15. MCP Tool — `oss402_discover`

Purpose:

Discover official maintainer certification services for a dependency.

Input:

```json
{
  "dependency": "odyssey-auth",
  "version": "1.0.0"
}
```

Output:

```json
{
  "services": [
    {
      "id": "odyssey-auth-conformance-v1",
      "type": "official_conformance",
      "maintainer": "Odyssey Auth Maintainers",
      "price": {
        "amount": "0.05",
        "currency": "USDC"
      },
      "network": "stellar-testnet"
    }
  ]
}
```

---

# 16. MCP Tool — `oss402_inspect`

Input:

```json
{
  "serviceId": "odyssey-auth-conformance-v1"
}
```

Output:

```json
{
  "dependency": "odyssey-auth@1.0.0",
  "suite": "v1",
  "official": true,
  "price": "0.05 USDC",
  "resultType": "PASS_FAIL",
  "attestationOnPass": true
}
```

---

# 17. MCP Tool — `oss402_purchase_certification`

Input:

```json
{
  "serviceId": "odyssey-auth-conformance-v1",
  "workspace": "apps/demo-valid",
  "commit": "CURRENT_GIT_SHA"
}
```

Behavior:

1. Call protected certification endpoint.
2. Receive HTTP 402.
3. Complete Stellar x402 payment.
4. Retry request with payment proof.
5. Receive certification run identifier.
6. Trigger certification workflow.

Output:

```json
{
  "success": true,
  "paid": "0.05 USDC",
  "runId": "cert_182",
  "transactionHash": "..."
}
```

---

# 18. MCP Tool — `oss402_certification_status`

Input:

```json
{
  "runId": "cert_182"
}
```

Possible output:

```json
{
  "status": "running"
}
```

or:

```json
{
  "status": "failed",
  "passed": 29,
  "failed": 1,
  "report": {
    "code": "AUTH-017",
    "message": "Expired token was accepted."
  }
}
```

or:

```json
{
  "status": "passed",
  "passed": 30,
  "failed": 0,
  "attestationId": "att_..."
}
```

---

# 19. MCP Tool — `oss402_verify_attestation`

Input:

```json
{
  "attestationId": "att_..."
}
```

Output:

```json
{
  "valid": true,
  "project": "demo-valid",
  "workspace": "apps/demo-valid",
  "commit": "...",
  "dependency": "odyssey-auth@1.0.0",
  "suite": "v1",
  "issuer": "G...",
  "result": "PASS"
}
```

---

# 20. x402 Protected Endpoint

Example:

```http
POST /api/certifications/odyssey-auth/v1
```

Request:

```json
{
  "repository": "github.com/example/oss402",
  "commit": "812fac...",
  "workspace": "apps/demo-valid",
  "dependency": "odyssey-auth@1.0.0"
}
```

Without valid payment:

```http
HTTP/1.1 402 Payment Required
```

Price:

```text
0.05 USDC
```

After valid x402 payment:

```http
HTTP/1.1 200 OK
```

Response:

```json
{
  "runId": "cert_182",
  "status": "queued"
}
```

Payment must be real on Stellar Testnet.

Do not simulate this step.

---

# 21. Certification Is Pay-Per-Run

The economic primitive is:

> **Certification attempt**

Not:

> Certificate purchase

Therefore:

```text
payment
   ↓
test execution
   ↓
PASS or FAIL
```

A failed run is still charged because compute, infrastructure, and maintainer-owned testing work were consumed.

For the demo, if repeated payments create too much operational friction, a single paid run may include one retry.

If implementing retries, make this explicit:

```text
0.05 USDC
includes:
- initial certification attempt
- 1 remediation retry
```

Do not hide this behavior.

---

# 22. GitHub Actions Runner

Use GitHub Actions for the MVP.

The workflow must receive at minimum:

```text
workspace
commit
suiteVersion
certificationRunId
```

Suggested workflow:

```text
Checkout exact commit
        ↓
Select workspace
        ↓
Install dependencies
        ↓
Build application
        ↓
Start application
        ↓
Load official conformance suite
        ↓
Run public tests
        ↓
Run private/dynamic tests
        ↓
Generate signed/evidenced result
        ↓
Return PASS / FAIL to OSS402
```

Example visible output:

```text
OSS402 Certification #182

Target:
apps/demo-invalid

Commit:
812fac...

Dependency:
odyssey-auth@1.0.0

Suite:
Odyssey Auth Conformance v1

Public tests:
10 / 10

Private tests:
14 / 15

Generated tests:
5 / 5

TOTAL:
29 / 30

FAIL

AUTH-017:
Expired token was accepted.
```

---

# 23. Source Code Privacy Model

The MVP must not require uploading the entire repository to OSS402 servers.

The code should execute inside the project's existing CI environment.

For the MVP:

```text
GitHub-hosted runner
```

OSS402 should receive only the certification evidence and metadata required to issue the result.

Example:

```json
{
  "runId": "cert_182",
  "repository": "github.com/example/oss402",
  "commit": "812fac...",
  "workspace": "apps/demo-valid",
  "dependency": "odyssey-auth@1.0.0",
  "suite": "v1",
  "runnerHash": "sha256:...",
  "result": "PASS",
  "testsPassed": 30,
  "testsFailed": 0,
  "logsHash": "sha256:..."
}
```

Do not claim this is zero-trust or confidential computing.

For the MVP, GitHub is part of the trusted execution boundary.

---

# 24. Attestation Model

Only issue an attestation after PASS.

Do not use NFT language.

Call it:

> **Maintainer Attestation**

Minimum attestation fields:

```text
issuer
repositoryHash
commit
workspaceHash
dependency
dependencyVersion
suiteVersion
configurationHash
runnerHash
timestamp
result
```

Example logical representation:

```json
{
  "issuer": "GMAINTAINER...",
  "repository": "github.com/example/oss402",
  "commit": "812fac...",
  "workspace": "apps/demo-valid",
  "dependency": "odyssey-auth",
  "dependencyVersion": "1.0.0",
  "suiteVersion": "v1",
  "result": "PASS",
  "timestamp": "2026-09-25T15:00:00Z"
}
```

Store only hashes/minimal metadata on-chain when appropriate.

Large logs and reports stay off-chain.

---

# 25. Attestation Binding

Because both demo applications live in the same repository and can share the same commit, the attestation must **not** be bound only to:

```text
repository + commit
```

It must be bound to:

```text
repository
+
commit
+
workspace path
+
dependency version
+
suite version
+
configuration/build hash
```

This prevents:

```text
apps/demo-valid
```

and:

```text
apps/demo-invalid
```

from being treated as the same certified subject.

---

# 26. Certification Staleness

A certification applies only to the exact subject that was tested.

If the project changes, the previous certification must not automatically cover the new build.

Example:

```text
Certified:
commit 812fac

Current:
commit 999abc
```

Verification UI should show:

```text
⚠ CERTIFICATION STALE
```

or:

```text
Certification applies to an older commit.
```

Do not claim the new commit failed certification.

Only claim that it has not been certified.

---

# 27. README Badge

After PASS, the agent may offer to add a README badge.

Example markdown:

```md
[![Odyssey Auth Conformant](https://oss402.dev/badge/att_182.svg)](
  https://oss402.dev/verify/att_182
)
```

Rendered concept:

```text
Odyssey Auth ✓ Maintainer Conformant
```

The badge must link to the verification page.

---

# 28. Agent Behavior After PASS

The agent should say something conceptually similar to:

```text
Official Odyssey Auth Conformance v1 passed.

Certified workspace:
apps/demo-valid

Certified commit:
812fac...

30 / 30 checks passed.

A maintainer attestation was issued on Stellar.

Would you like me to add the verification badge to README.md?
```

The badge modification must be opt-in unless repository automation policy explicitly allows it.

---

# 29. Agent Behavior After FAIL

Expected response:

```text
Official certification failed.

29 / 30 checks passed.

Failure:
AUTH-017 — Expired token was accepted.

No maintainer attestation was issued.

I can inspect the integration and propose a fix.
```

The agent must never claim certification after FAIL.

---

# 30. Dashboard / Verification UI

Keep UI minimal.

## Verification Page

Example:

```text
ODYSSEY AUTH

✓ MAINTAINER CONFORMANT

Project
demo-valid

Repository
github.com/example/oss402

Workspace
apps/demo-valid

Commit
812fac...

Dependency
odyssey-auth@1.0.0

Suite
Odyssey Auth Conformance v1

Result
30 / 30 PASS

Issuer
Odyssey Auth Maintainers

Stellar Attestation
G... / transaction...
```

## Maintainer Dashboard

Example:

```text
ODYSSEY AUTH

Official Conformance v1

Certification runs
2

Passed
1

Failed
1

Revenue
0.10 USDC
```

Do not overbuild charts.

---

# 31. Demo Flow

The hackathon demo should be deterministic.

## Demo A — Invalid Project

Target:

```text
apps/demo-invalid
```

Flow:

```text
Agent detects production requirement
        ↓
detects odyssey-auth certification requirement
        ↓
discovers official certification
        ↓
price = 0.05 USDC
autonomous limit = 0.10 USDC
        ↓
purchases via x402
        ↓
GitHub Actions runs conformance suite
        ↓
29 / 30
        ↓
FAIL
        ↓
no attestation
```

This proves:

- payment does not guarantee approval,
- the suite catches a real integration issue.

## Demo B — Valid Project

Target:

```text
apps/demo-valid
```

Same flow:

```text
Agent detects requirement
        ↓
purchases certification
        ↓
same official suite runs
        ↓
30 / 30
        ↓
PASS
        ↓
Maintainer Attestation on Stellar
        ↓
README badge suggested
```

This proves:

- same library,
- same suite,
- same workflow,
- different project state,
- legitimate PASS.

---

# 32. Reproducible Local Commands

Provide simple commands.

Suggested:

```bash
pnpm install
```

Run normal app tests:

```bash
pnpm test:valid
pnpm test:invalid
```

Both should succeed.

Run local public conformance baseline:

```bash
pnpm conformance:public:valid
pnpm conformance:public:invalid
```

Optionally expose full demo helpers:

```bash
pnpm demo:valid
pnpm demo:invalid
```

Actual official certification still requires the paid OSS402 flow.

---

# 33. Important Demo Property

Normal tests should not reveal the deliberately bad integration.

Example:

```text
demo-invalid

Unit tests    PASS
Build         PASS
Lint          PASS
```

Then official conformance:

```text
Odyssey Auth Conformance

FAIL
```

This creates the visual contrast:

> Your tests say the app works.  
> The maintainer's official suite catches what your project missed.

---

# 34. Suggested Tech Stack

## Monorepo

```text
pnpm
TypeScript
```

## Demo apps

```text
Node.js
Fastify or Express
```

## Library

```text
TypeScript
```

## Conformance suite

```text
Vitest
Supertest / fetch
fast-check for lightweight property testing if useful
```

## API

```text
Fastify / Express / Next API
```

## Dashboard

```text
Next.js
React
Tailwind
shadcn/ui
```

## Agent integration

```text
MCP
Agent Skill
```

## Payments

```text
Stellar Testnet
x402
USDC-compatible test asset
```

## Attestation

```text
Soroban or minimal Stellar-verifiable attestation mechanism
```

Choose the simplest implementation that produces a verifiable on-chain result.

---

# 35. Security / Integrity Requirements

For MVP:

- exact commit must be recorded,
- exact workspace must be recorded,
- suite version must be recorded,
- dependency version must be recorded,
- result must be deterministic,
- attestation only on PASS,
- FAIL never creates a positive attestation,
- payment must not imply PASS,
- README badge must point to verifiable metadata,
- previous certification must not silently apply to changed code.

---

# 36. Maintainer Manifest

`odyssey-auth` should expose machine-readable OSS402 metadata.

Example:

```json
{
  "schemaVersion": "0.1",
  "project": {
    "name": "odyssey-auth",
    "version": "1.0.0"
  },
  "maintainer": {
    "name": "Odyssey Auth Maintainers",
    "stellarAddress": "G..."
  },
  "certifications": [
    {
      "id": "odyssey-auth-conformance-v1",
      "type": "official_conformance",
      "price": {
        "amount": "0.05",
        "currency": "USDC",
        "network": "stellar-testnet"
      },
      "endpoint": "/api/certifications/odyssey-auth/v1"
    }
  ]
}
```

Possible location:

```text
/.well-known/oss402.json
```

or package metadata.

For MVP, one approach is enough.

---

# 37. README Main Message

The repository README should explain OSS402 using this progression:

```text
Open source remains free.
        ↓
Maintainers define official conformance.
        ↓
AI agents can purchase a certification run.
        ↓
The exact project build is tested.
        ↓
PASS produces a maintainer attestation.
```

Core line:

> **Tests tell you that your code works. OSS402 tells you that the maintainer agrees.**

Secondary line:

> **AI uses upstream. AI pays upstream.**

---

# 38. One-Sentence Pitch

> **OSS402 lets AI agents pay open-source maintainers for official conformance testing, with successful project builds receiving a version-bound, publicly verifiable maintainer attestation on Stellar.**

---

# 39. Product Principle

Do not design the system around the assumption that AI is incapable of solving the problem itself.

A frontier coding agent may be able to:

- inspect the source,
- reason about the library,
- create its own tests,
- patch integration issues.

OSS402 still provides something different:

> **Official maintainer-backed certification.**

The protocol sells authority and conformance evidence, not model intelligence.

---

# 40. Acceptance Criteria

The hackathon MVP is complete only when all of the following are true:

- [ ] One monorepo contains all demo components.
- [ ] `odyssey-auth` exists and is functional.
- [ ] `demo-valid` uses `odyssey-auth`.
- [ ] `demo-invalid` uses the same `odyssey-auth`.
- [ ] Normal tests pass in both demo apps.
- [ ] A deliberate integration issue exists only in `demo-invalid`.
- [ ] One reusable conformance suite tests both apps.
- [ ] `demo-invalid` fails official conformance.
- [ ] `demo-valid` passes official conformance.
- [ ] Both apps use `oss402.yml`.
- [ ] Agent Skill exists and documents the protocol.
- [ ] MCP server exposes discovery, purchase, status, and verification tools.
- [ ] Agent detects production certification requirement.
- [ ] Agent discovers the Odyssey Auth official service.
- [ ] Agent reads certification price.
- [ ] Agent checks the autonomous spending limit.
- [ ] Agent can autonomously initiate the purchase.
- [ ] Protected endpoint returns HTTP 402 before payment.
- [ ] Payment completes on Stellar Testnet.
- [ ] Payment transaction hash is recorded.
- [ ] Certification workflow executes via GitHub Actions.
- [ ] Exact repository, commit, and workspace are included in evidence.
- [ ] FAIL does not issue attestation.
- [ ] PASS issues a Stellar-verifiable maintainer attestation.
- [ ] Verification page displays the attestation metadata.
- [ ] README badge can link to the verification page.
- [ ] Certification can be marked stale when project state changes.
- [ ] Demo can be reproduced without manually modifying source between FAIL and PASS examples.

---

# 41. Implementation Priority

Build in this order.

## Phase 1 — Core deterministic demo

1. `odyssey-auth`
2. `demo-valid`
3. `demo-invalid`
4. reusable conformance suite
5. deterministic PASS / FAIL

Do not continue until this works.

## Phase 2 — Certification orchestration

6. `oss402.yml`
7. certification manifest
8. OSS402 API
9. run identifiers
10. GitHub Actions workflow
11. result callback/status

## Phase 3 — Payments

12. x402 protected endpoint
13. Stellar Testnet payment
14. payment verification
15. maintainer wallet revenue display

## Phase 4 — Agent integration

16. MCP tools
17. Agent Skill
18. autonomous budget policy
19. production trigger
20. status polling

## Phase 5 — Attestation

21. PASS-only attestation
22. Stellar verification
23. public verification page
24. stale-state logic

## Phase 6 — Presentation polish

25. README badge
26. maintainer dashboard
27. Documentation set under `docs/` (architecture, setup, x402, operations, testing, security)
28. reproducibility commands
29. screenshots/logging
30. clean hackathon README

---

# 42. Stop Condition

Once the following sequence works reliably:

```text
Agent
→ detects certification requirement
→ discovers Odyssey Auth service
→ pays via x402
→ GitHub Actions runs official suite
→ invalid app FAILS
→ valid app PASSES
→ Stellar attestation is created
→ badge verifies the exact build
```

**stop adding features.**

That flow is the MVP.

---

# 43. Final Mental Model

OSS402 is not:

```text
pay for open source
```

It is:

```text
pay the maintainer
for an official certification run
of your exact project build
```

The certification result is:

```text
FAIL
```

or:

```text
PASS
    ↓
Maintainer Attestation
    ↓
Stellar
```

The core trust statement is:

> **This exact workspace at this exact commit, using this exact dependency version, passed this exact version of the maintainer's official conformance suite.**

That is the entire product the hackathon MVP must prove.
