# OSS402

**Tests tell you that your code works. OSS402 tells you that the maintainer agrees.**

**AI uses upstream. AI pays upstream.**

OSS402 is a machine-native certification protocol for open-source software. Source, docs, and stable releases stay free. Maintainers charge for an official conformance run of the exact project build an agent is shipping.

An agent can:

1. detect that production requires official `odyssey-auth` certification,
2. discover the maintainer service,
3. pay **0.05 USDC** via x402 on Stellar Testnet,
4. run the official conformance suite against that workspace and commit,
5. receive PASS or FAIL,
6. and, only after PASS, receive a version-bound maintainer attestation on Stellar.

Payment buys a certification **run**, not a certificate. A FAIL still settles. No attestation is issued on FAIL.

**Track:** AI Agents & Automated Workflows · Stellar Odyssey Perú 2026  
**Network:** Stellar Testnet · **Protocol:** x402 · **Model:** pay-per-certification-run  
**Demo library:** `odyssey-auth` v1.0.0

## Pitch

> OSS402 lets AI agents pay open-source maintainers for official conformance testing, with successful project builds receiving a version-bound, publicly verifiable maintainer attestation on Stellar.

## Start here

Prerequisites: Node.js 20+, pnpm 10.24, and a Stellar Testnet payer wallet funded with USDC.

```bash
pnpm install
Copy-Item .env.example .env
pnpm dev:api
pnpm dev:dashboard
```

On bash or zsh, use `cp .env.example .env`.

Open:

- Public landing: http://localhost:3000/
- Maintainer ledger: http://localhost:3000/maintainer
- API health: http://127.0.0.1:8787/health
- Certification manifest: http://127.0.0.1:8787/.well-known/oss402.json

Set `MAINTAINER_STELLAR_ADDRESS` and `STELLAR_PRIVATE_KEY` in `.env` before a paid run. Do not commit `.env`.

For install, wallets, and the first paid run, read [Getting Started](docs/GETTING_STARTED.md).

## Documentation index

README is the entry point. Continue with the document that matches the work you are doing:

| Document | Use it when you need to… |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | Understand services, trust boundaries, request flows, and what an attestation binds |
| [Getting Started](docs/GETTING_STARTED.md) | Install, start, and verify a local stack |
| [Configuration](docs/CONFIGURATION.md) | Configure settlement, the dashboard, and secrets |
| [MCP and Agent Skill](docs/MCP_AND_AGENT_SKILL.md) | Connect OpenCode and follow the certification skill |
| [x402 and Stellar](docs/X402_STELLAR.md) | Pay for a run and read Testnet settlement evidence |
| [Operations](docs/OPERATIONS.md) | Run the API, inspect the ledger, and read a credential |
| [Testing](docs/TESTING.md) | Run unit tests, the official suite, and a paid check |
| [Security](docs/SECURITY.md) | Review who may hold the payer key and the maintainer key |
| [Product requirements](docs/PRD.md) | Read the product decisions for the hackathon MVP |

`docs/archive/PRD-v1.md` is the earlier checkpoint. It is not the current spec.

## Product model

OSS402 combines five capabilities:

1. **Free library** — `odyssey-auth` stays free to install, read, and ship.
2. **Project policy** — `oss402.yml` says production requires official certification and caps autonomous spend.
3. **Agent Skill** — `.agents/skills/oss402-certification/SKILL.md` tells the agent when to buy a run and what to say on PASS or FAIL.
4. **MCP payer** — `packages/oss402-mcp` discovers the service, pays 0.05 USDC, and polls the result.
5. **Maintainer authority** — the API runs the official suite and, only on PASS, writes a Soroban attestation.

The agent pays the maintainer. The maintainer does not sponsor the run.

## Two reference apps

Both apps use the same library and the same suite. Do not edit their source between a FAIL run and a PASS run. The contrast is the product.

| App | Unit tests | Official suite | Attestation |
| --- | --- | --- | --- |
| `apps/demo-valid` | PASS | PASS (30/30) | Issued |
| `apps/demo-invalid` | PASS | FAIL (`AUTH-017`) | None |

`demo-invalid` accepts expired tokens on purpose. Its own tests still pass. The maintainer suite catches it.

## Certification service

| Field | Value |
| --- | --- |
| Service | `odyssey-auth-conformance-v1` |
| Price | 0.05 USDC per run |
| Included | Initial attempt + 1 remediation retry |
| Network | `stellar:testnet` |
| Facilitator | `https://www.x402.org/facilitator` |
| Autonomous cap in the demo apps | 0.10 USDC |
| Session budget in the demo apps | 1.00 USDC |

Policy is read from `oss402.yml` before purchase. Payment is not proof of PASS.

## Runtime topology

```text
Coding agent + skill
        │ MCP stdio
        ▼
oss402-mcp
        │ x402 buyer (payer key)
        ▼
OSS402 API :8787 ───── local store (data/store.json)
        │ paid POST, then local suite or GitHub Actions
        ▼
odyssey-auth-conformance ───── demo-valid :3001 or demo-invalid :3002
        │
        ├─ FAIL: report only
        └─ PASS: Soroban attestation on Stellar Testnet

Dashboard :3000 reads the API. It never holds a signing key.
```

See [Architecture](docs/ARCHITECTURE.md) for the sequence and the subject hash.

## Stellar Testnet evidence

| Evidence | Stellar Expert |
| --- | --- |
| Attestation contract | [Contract](https://stellar.expert/explorer/testnet/contract/CAHOYKJPZNQ73XH3WCW7KLKWYT3SIHWL3UNEVTDNIMRQPIQMYBAVBMSI) |
| Contract deploy | [Transaction](https://stellar.expert/explorer/testnet/tx/476a836d8a3f01a4109096baa98147be833c0b6f4931f46d5655b9f3bc08d0b8) |
| `demo-invalid` FAIL payment (`cert_7`) | [0.05 USDC](https://stellar.expert/explorer/testnet/tx/3081b8c198cd60d3f453e7c2bb2a737eeb742ad35e20d2bfb35712cdfd38d275) |
| `demo-valid` PASS payment (`cert_8`) | [0.05 USDC](https://stellar.expert/explorer/testnet/tx/8f64518bd223b08a88d36d3f1a4d74baf5872dfb6de73487b2d1d862d959d851) |
| `demo-valid` PASS attestation (`att_5`) | [Soroban write](https://stellar.expert/explorer/testnet/tx/b7c9e45add1fc46c01556f1b977c868a01ff13784e46b101840116bbba393420) |

The FAIL payment settled and did not create an attestation. The PASS payment and the attestation write are different transactions. Details are in [x402 and Stellar](docs/X402_STELLAR.md).

## Repository map

```text
apps/
  demo-valid/          correct odyssey-auth integration
  demo-invalid/        deliberate expired-token config
  oss402-api/          x402 resource server and certification runner
  dashboard/           public landing, credential page, maintainer ledger
packages/
  odyssey-auth/                 free demo library
  odyssey-auth-conformance/     official suite
  oss402-client/                shared types and payment-header decoding
  oss402-mcp/                   agent tools and x402 buyer
contracts/
  oss402-attestation/           Soroban PASS attestation
.agents/skills/oss402-certification/
docs/                           maintainer and user documentation
```

## Development commands

```bash
pnpm install
pnpm test:valid
pnpm test:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
pnpm dev:api
pnpm dev:dashboard
pnpm pay:certify apps/demo-valid <commit-sha>
```

`pnpm dev:mcp` starts the MCP server on stdio. OpenCode normally launches it from `opencode.jsonc`.

## Project status and scope

The repository is a hackathon MVP. The current scope includes:

- a free demo library and two reference apps;
- an official conformance suite with a deterministic PASS and FAIL;
- x402 settlement of 0.05 USDC on Stellar Testnet;
- an MCP buyer and an Agent Skill;
- a PASS-only Soroban attestation;
- a public credential page and a maintainer ledger.

The current MVP does not include:

- mainnet settlement;
- a multi-maintainer marketplace;
- production secret management, TLS, or rate limiting;
- a hosted API. Local runs are the supported path.

## Verification

Before treating a change as demo-ready:

```bash
pnpm test:valid
pnpm test:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
```

Paid settlement is a separate check. Use one controlled run and confirm the Stellar Expert transaction, as described in [Testing](docs/TESTING.md).

## Documentation conventions

- Keep README as the navigation index and the product contract.
- Put setup, architecture, payment, and operations in `docs/`.
- Keep product decisions in `docs/PRD.md`.
- Keep the agent workflow in `.agents/skills/oss402-certification/SKILL.md` and the short rules in `AGENTS.md`.
- Update links and evidence hashes when a new official run replaces the ones listed above.

## Repository

https://github.com/hallzyx/oss402
