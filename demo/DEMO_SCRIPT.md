# OSS402 Demo Script (~90–120s)

## Setup before the pitch

1. Fund maintainer and agent wallets on Stellar Testnet (XLM + USDC trustline + Circle faucet).
2. Copy `.env.example` → `.env` with `MAINTAINER_STELLAR_ADDRESS` and `STELLAR_PRIVATE_KEY`.
3. `pnpm install && pnpm --filter odyssey-auth build && pnpm --filter demo-kit build`
4. Start API: `pnpm dev:api`
5. Start dashboard: `pnpm dev:dashboard`
6. Connect the MCP server / load the certification skill.

## Narrative

> Open source remains free. Maintainers define official conformance. AI agents can purchase a certification run. The exact project build is tested. PASS produces a maintainer attestation.

Tagline: **AI uses upstream. AI pays upstream.**

## Demo A — Invalid project

Target: `apps/demo-invalid`

1. Show unit tests pass: `pnpm test:invalid`
2. Agent reads `oss402.yml` → production requires `odyssey-auth` certification.
3. Discover service → **0.05 USDC**, autonomous limit **0.10**.
4. Purchase via x402 (show HTTP 402, then settlement hash).
5. Suite runs → **29 / 30 FAIL** → `AUTH-017: Expired token was accepted.`
6. Confirm **no attestation** was issued.
7. Show maintainer revenue increased by 0.05 USDC.

Point to prove: **payment does not buy a certificate**.

## Demo B — Valid project

Target: `apps/demo-valid`

1. Same purchase flow, no source edits between demos.
2. Suite runs → **30 / 30 PASS**.
3. Maintainer attestation recorded (subject bound to workspace + commit + config hash).
4. Open verification page `/verify/att_…`.
5. Optionally add README badge (ask first).

Point to prove: same library, same suite, different project state, legitimate PASS.

## Expected local baselines (no payment)

```bash
pnpm conformance:full:valid    # PASS 30/30
pnpm conformance:full:invalid  # FAIL 29/30 AUTH-017
```

## Stop condition

Once detect → discover → pay → suite → invalid FAIL / valid PASS → attestation → badge verify works reliably, stop adding features.
