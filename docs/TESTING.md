# Testing and Verification

OSS402 has three layers. Keep them separate when you report a result.

| Layer | Spends USDC? | What a pass means |
| --- | ---: | --- |
| App unit tests | No | The demo app's own tests passed |
| Official conformance suite | No | The maintainer suite accepted that workspace |
| Paid certification run | Yes, 0.05 | The API recorded settlement and the suite result |

`demo-invalid` passes its unit tests and fails the official suite. Quoting the unit tests as certification is incorrect.

## Quick path

```bash
pnpm test:valid
pnpm test:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
```

## Commands

| Command | Coverage |
| --- | --- |
| `pnpm test:valid` | `apps/demo-valid` unit tests |
| `pnpm test:invalid` | `apps/demo-invalid` unit tests |
| `pnpm conformance:public:valid` | Public conformance cases against `demo-valid` |
| `pnpm conformance:public:invalid` | Public conformance cases against `demo-invalid` |
| `pnpm conformance:full:valid` | Full official suite, expect 30/30 PASS |
| `pnpm conformance:full:invalid` | Full official suite, expect 29/30 and `AUTH-017` |
| `pnpm pay:certify <workspace> <label>` | One paid run against a running API |

The conformance commands do not talk to the API and do not settle x402. Use them before spending.

## Expected baselines

Recorded in `demo/expected-results/README.md`:

```text
demo-valid
  unit tests      PASS
  official suite  30/30 PASS
  attestation     issued only after a paid or local certification run

demo-invalid
  unit tests      PASS
  official suite  29/30 FAIL
  failure         AUTH-017 Expired token was accepted.
  attestation     none
```

Do not change `apps/demo-valid` or `apps/demo-invalid` to force the other result. The two trees are the contrast.

## Paid smoke test

1. Start `pnpm dev:api` and `pnpm dev:dashboard`.
2. Confirm `GET /health` shows `payToConfigured: true` and `price: "$0.05"`.
3. Run `pnpm pay:certify apps/demo-invalid <label>`.
4. Confirm status `failed`, report `AUTH-017`, a 64-hex `paymentTx`, and no attestation id.
5. Run `pnpm pay:certify apps/demo-valid <label>` without editing source.
6. Confirm status `passed`, an `attestationId`, and a payment hash different from the Soroban hash.
7. Open `/maintainer` and `/verify/<attestationId>`.

One pair of runs is enough. Do not loop purchases to debug the UI.

`pnpm --filter oss402-api demo:certify <workspace>` skips the chain. The ledger shows `local-dev-no-chain`. That is a runner check, not settlement evidence.

## Acceptance checklist

- Free install of `odyssey-auth` still does not require payment.
- FAIL settles 0.05 USDC and writes no attestation.
- PASS settles 0.05 USDC and binds repository, commit, workspace, dependency, suite, and configuration hash.
- The credential URL exists only for a PASS id.
- A stale subject is reported as not covered, not as a suite failure.
- The payer secret is not in git.

## Related documents

- [Getting Started](GETTING_STARTED.md)
- [Operations](OPERATIONS.md)
- [x402 and Stellar](X402_STELLAR.md)
