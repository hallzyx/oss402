# AGENTS.md

This repository implements **OSS402**, a machine-native certification protocol.

## Product rules

- Open source stays free.
- Agents pay for an official **certification run**, not a certificate.
- FAIL never issues a maintainer attestation.
- PASS issues a version-bound attestation for:
  - repository
  - commit
  - workspace path
  - dependency version
  - suite version
  - configuration/build hash
- Payment must settle on **Stellar Testnet** via **x402**. Do not fake settlement in demos.

## Preferred tools

Use the MCP server in `packages/oss402-mcp`:

- `oss402_discover`
- `oss402_inspect`
- `oss402_purchase_certification`
- `oss402_certification_status`
- `oss402_verify_attestation`

Follow `.agents/skills/oss402-certification/SKILL.md`.

Pass `workspace` as `apps/demo-invalid` or `apps/demo-valid`. Pass `repository` as `github.com/hallzyx/oss402`.

On PASS, print `http://localhost:3000/verify/{attestationId}` on its own line. On FAIL, do not invent a credential URL.

## Local commands

```bash
pnpm install
pnpm test:valid
pnpm test:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
pnpm dev:api
pnpm dev:dashboard
pnpm dev:mcp
```

## Demo targets

- `apps/demo-invalid` → official FAIL (`AUTH-017`)
- `apps/demo-valid` → official PASS + attestation

Do not edit source between those demos. The contrast is intentional.

## Documentation

Human-facing setup and payment docs are indexed from `README.md`. Start with `docs/PROTOCOL.md`, `docs/GETTING_STARTED.md`, and `docs/MCP_AND_AGENT_SKILL.md`.
