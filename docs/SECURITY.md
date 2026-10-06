# Security Model

OSS402 separates the payer, the maintainer recipient, the certification authority, and the public dashboard. This document describes the hackathon MVP and the boundaries that have to stay intact.

## Security principles

1. Open-source code does not require a payment to read or install.
2. The browser never receives `STELLAR_PRIVATE_KEY`.
3. The API does not need the payer secret to charge a run. The buyer signs. The facilitator settles to the maintainer address.
4. FAIL must not be rewritten into an attestation.
5. The payment requirements advertised by the API are the requirements the buyer pays: exact scheme, Stellar Testnet, 0.05 USDC, maintainer recipient.
6. An attestation covers one subject. A different commit or workspace is not silently certified.

## Credential boundaries

| Credential | Allowed location | Never expose to |
| --- | --- | --- |
| `STELLAR_PRIVATE_KEY` | Root `.env`, MCP process, `pay:certify` | Dashboard, git, API responses, skill text |
| `MAINTAINER_STELLAR_ADDRESS` | `.env`, public ledger, attestation issuer | — it is a public address |
| `STELLAR_IDENTITY` secret | Local Stellar CLI identity used by the API for `attest` | Browser, MCP responses |
| `GITHUB_TOKEN` | API environment, only if Actions dispatch is on | Browser, MCP |
| `OSS402_CALLBACK_SECRET` | API and the Actions workflow | Public docs and the dashboard |
| `X402_FACILITATOR_API_KEY` | API environment, if the facilitator requires it | Browser |

`opencode.jsonc` must not contain the payer secret. `{env:STELLAR_PRIVATE_KEY}` is unsafe here: an empty expansion shadows the `.env` value. The MCP loads the file itself.

## Payment safety

Before a run is accepted the facilitator has to settle the advertised payment. The API stores `paymentTx` from the settlement result, not from a client-supplied field in the JSON body.

The buyer reads the hash from `PAYMENT-RESPONSE`. A missing hash means the run must not be described as settled, even if a local suite result exists.

`demo:certify` is explicitly unpaid. Its `paymentTx` value `local-dev-no-chain` must not be linked as a Stellar transaction.

## Attestation safety

`attest` runs only after the suite result is PASS. The subject includes workspace and configuration hash so `demo-valid` and `demo-invalid` cannot share an attestation just because they share a commit.

The verification page and `oss402_verify_attestation` should be treated as stale when the current commit or workspace differs. Stale is not a successful certification of the new build.

## Input and execution

- The paid endpoint requires `repository`, `commit`, and `workspace`.
- The local runner resolves `workspace` under the repository root. Callers must pass `apps/demo-valid` or `apps/demo-invalid`.
- The conformance suite is the maintainer's test code. Shipping a green unit test in the demo app does not satisfy it.
- Callback finalization is protected by `OSS402_CALLBACK_SECRET` when that variable is set. Leave the secret unset only on a machine where the callback port is not exposed.

## MVP limits

This repository is a local demo:

- the ledger is a JSON file, not an authenticated multi-user database;
- the dashboard has no login. Anyone who can open the port can read runs;
- there is no rate limit on the paid endpoint beyond the x402 price;
- GitHub token and payer key handling are environment variables, not a secret manager.

Do not point this stack at mainnet funds or at a public host without reviewing those limits.

## Related documents

- [Configuration](CONFIGURATION.md)
- [x402 and Stellar](X402_STELLAR.md)
- [Architecture](ARCHITECTURE.md)
