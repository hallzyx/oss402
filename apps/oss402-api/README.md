# oss402-api

Certification authority. It publishes the service catalog, charges `POST /api/certifications/odyssey-auth/v1` with x402, runs the official suite, and writes a Soroban attestation only after PASS.

```bash
pnpm dev:api
```

Listens on http://127.0.0.1:8787. Health is `GET /health`. The ledger file is `data/store.json`.

`pnpm pay:certify <workspace> <commit-label>` buys one run from the shell and spends 0.05 USDC. `pnpm --filter oss402-api demo:certify <workspace>` records a run with no chain payment (`paymentTx` is `local-dev-no-chain`).

Endpoints and the PASS/FAIL body: [Protocol](../../docs/PROTOCOL.md). Settlement: [x402 and Stellar](../../docs/X402_STELLAR.md).
