# OSS402

**Tests tell you that your code works. OSS402 tells you that the maintainer agrees.**

**AI uses upstream. AI pays upstream.**

OSS402 is a machine-native certification protocol for open-source software. Source, docs, and stable releases stay free. Maintainers monetize official conformance testing of the exact project build an AI agent is shipping.

An agent can:

1. detect that production requires official `odyssey-auth` certification,
2. discover the maintainer service,
3. pay **0.05 USDC** via x402 on Stellar Testnet,
4. trigger the official conformance suite in GitHub Actions,
5. receive PASS or FAIL,
6. and, only after PASS, receive a version-bound maintainer attestation on Stellar.

Payment buys a certification **run**, not a certificate. A FAIL still consumes the paid run. No attestation is issued on FAIL.

**Track:** AI Agents & Automated Workflows · Stellar Odyssey Perú 2026  
**Network:** Stellar Testnet · **Protocol:** x402 · **Model:** pay-per-certification-run  
**Demo library:** `odyssey-auth`

## Pitch

> OSS402 lets AI agents pay open-source maintainers for official conformance testing, with successful project builds receiving a version-bound, publicly verifiable maintainer attestation on Stellar.

## Docs

| Doc | Link |
| --- | --- |
| Scheme and flows | [docs/esquema.md](docs/esquema.md) |
| Product requirements | [docs/PRD.md](docs/PRD.md) |
| Demo script | [demo/DEMO_SCRIPT.md](demo/DEMO_SCRIPT.md) |
| Agent instructions | [AGENTS.md](AGENTS.md) |

## Core flow

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
if PASS: maintainer attestation on Stellar
   ↓
README badge / verification page
```

## Two demo apps

Both apps use the same `odyssey-auth` package and the same conformance suite.

| App | Unit tests | Official suite | Attestation |
| --- | --- | --- | --- |
| `apps/demo-valid` | PASS | PASS (30/30) | Issued |
| `apps/demo-invalid` | PASS | FAIL (`AUTH-017`) | None |

`demo-invalid` accepts expired tokens on purpose. Normal tests still pass. The maintainer suite catches it.

## Monorepo

```text
apps/
  demo-valid/          correct odyssey-auth integration
  demo-invalid/        deliberate config error
  oss402-api/          x402 + certification orchestration
  dashboard/           verification + maintainer revenue
packages/
  odyssey-auth/        OSS demo library
  odyssey-auth-conformance/
  oss402-client/
  oss402-mcp/
contracts/
  oss402-attestation/
.agents/skills/oss402-certification/
.github/workflows/oss402-certification.yml
```

## Quick start

```bash
pnpm install
pnpm test:valid
pnpm test:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
```

### Paid certification (x402)

1. Copy `.env.example` → `.env`
2. Set `MAINTAINER_STELLAR_ADDRESS` (G…, USDC trustline on testnet)
3. Set `STELLAR_PRIVATE_KEY` (agent payer wallet, funded with testnet USDC)
4. `pnpm dev:api`
5. `pnpm pay:certify apps/demo-valid <commit-sha>`

Local orchestration without chain payment: `pnpm --filter oss402-api demo:certify apps/demo-valid`

## Repository

https://github.com/hallzyx/oss402
