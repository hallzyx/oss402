# Getting Started

This guide takes a checkout to a local OSS402 stack that can settle a real 0.05 USDC certification run on Stellar Testnet.

## Prerequisites

- Node.js 20 or newer
- pnpm 10.24 (`packageManager` in the root `package.json`)
- A Stellar Testnet account that will pay (secret key, USDC trustline, a small USDC balance)
- A Stellar Testnet maintainer account that will receive USDC (address only is required in `.env`)

The payer and the maintainer are different accounts. The payer signs the 0.05 USDC transfer. The maintainer address only receives it, and it must be able to hold USDC.

## Fund the two Testnet accounts

Use Stellar Testnet USDC. Asset code `USDC`, issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`. That is the asset x402 settles on `stellar:testnet`.

Create two keypairs (Stellar Lab, Freighter on testnet, or `stellar keys generate`). Keep the payer secret for `.env`. Keep the maintainer secret only if that same account will sign Soroban `attest` calls. The API needs the maintainer **address** to get paid.

For each account:

1. Fund XLM so the account exists and can pay fees. Open [Stellar Lab fund](https://lab.stellar.org/account/fund) and paste the public key, or request Friendbot directly:

   ```text
   https://friendbot.stellar.org?addr=G...
   ```

2. Add a USDC trustline. On the same Lab fund page, use the trustline action. Or in [Lab Transaction Builder](https://lab.stellar.org/transaction/build), fetch the next sequence number and add **Change Trust** with asset `USDC` and issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`. Sign and submit on Testnet. Do this for the payer and the maintainer. A maintainer without a trustline cannot receive the payment (`op_no_trust`).

3. Fund the **payer** with testnet USDC. Open the [Circle faucet](https://faucet.circle.com), choose Stellar Testnet, and submit the payer public key. A few USDC is enough. Each certification run spends 0.05.

You do not need to faucet USDC to the maintainer. That account only needs the trustline so settlement can credit it.

Confirm both accounts on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet) before the first paid run.

## 1. Create local configuration

```bash
pnpm install
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On bash:

```bash
cp .env.example .env
```

Set at least:

```dotenv
MAINTAINER_STELLAR_ADDRESS=G...
STELLAR_PRIVATE_KEY=S...
OSS402_RUN_LOCALLY=1
NEXT_PUBLIC_OSS402_VERIFY_URL=http://localhost:3000
NEXT_PUBLIC_OSS402_API_URL=http://127.0.0.1:8787
```

Do not commit `.env`. It contains the payer secret.

The attestation contract is already deployed. Uncomment `ATTESTATION_CONTRACT_ID` from `.env.example` if PASS should write on-chain. The deployed id is in `contracts/deployments.testnet.json`.

## 2. Start the stack

In two terminals, from the repository root:

```bash
pnpm dev:api
pnpm dev:dashboard
```

The API listens on http://127.0.0.1:8787. The dashboard listens on http://localhost:3000.

## 3. Open the interfaces

| Interface | URL |
| --- | --- |
| Public landing | http://localhost:3000/ |
| Maintainer ledger | http://localhost:3000/maintainer |
| Credential page | http://localhost:3000/verify/att_5 |
| API health | http://127.0.0.1:8787/health |
| Manifest | http://127.0.0.1:8787/.well-known/oss402.json |

`att_5` is a PASS credential already recorded in a local store from the reference demo. A fresh store will not have it until you run a PASS certification. The public contract and payment hashes in the README do not depend on your local store.

## 4. Verify without paying

```bash
pnpm test:valid
pnpm test:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
```

Expected:

| Command | Result |
| --- | --- |
| `pnpm test:valid` | Unit tests pass |
| `pnpm test:invalid` | Unit tests pass |
| `pnpm conformance:full:valid` | 30/30 PASS |
| `pnpm conformance:full:invalid` | 29/30 FAIL, `AUTH-017` |

Unit tests of `demo-invalid` passing is intentional. That app is still not officially certified.

## 5. First paid run

With the API running and `.env` funded:

```bash
pnpm pay:certify apps/demo-invalid local-fail-check
```

Then, without editing either demo app:

```bash
pnpm pay:certify apps/demo-valid local-pass-check
```

Each command spends 0.05 USDC. The FAIL run must not print a `/verify/` URL. The PASS run returns an attestation id. Open `http://localhost:3000/verify/<attestationId>` and refresh `http://localhost:3000/maintainer`. The Payment column should be a Stellar Expert link, not a dash.

To buy the run from an agent instead of the script, connect OpenCode as described in [MCP and Agent Skill](MCP_AND_AGENT_SKILL.md).

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm dev:api` | Start the certification API in watch mode |
| `pnpm dev:dashboard` | Start the Next.js dashboard |
| `pnpm dev:mcp` | Start the MCP server on stdio |
| `pnpm pay:certify <workspace> <commit-label>` | Buy one run from the shell |
| `pnpm --filter oss402-api demo:certify <workspace>` | Record a local run with no chain payment |
| `pnpm test:valid` / `pnpm test:invalid` | App unit tests |
| `pnpm conformance:full:valid` / `pnpm conformance:full:invalid` | Official suite, no payment |

`demo:certify` writes `paymentTx` as `local-dev-no-chain`. Use it to exercise the runner. Do not present it as x402 settlement.

## Troubleshooting

### The purchase says the payer key is missing

The MCP reads `STELLAR_PRIVATE_KEY` from the repository `.env`. OpenCode must be opened at the repository root, and `opencode.jsonc` must not inject an empty `STELLAR_PRIVATE_KEY`. Reconnect the MCP after changing that file.

### The maintainer page shows a dash in Payment

A 64-character hex hash becomes a Stellar Expert link. `pending-x402-settlement` and any other placeholder render as a dash. `local-dev-no-chain` renders as "Local only". Confirm the API process was started after the latest code and that the facilitator returned a settlement transaction.

### The dashboard cannot reach the API

`NEXT_PUBLIC_OSS402_API_URL` must be a URL the browser can open. `http://127.0.0.1:8787` is the local default. Restart `pnpm dev:dashboard` after changing it.

### PASS has no Soroban transaction

Set `ATTESTATION_CONTRACT_ID` and a Stellar identity that can invoke `attest`. Without the contract id, the API still records a local attestation. The credential page then shows a local record instead of an explorer hash.

## Next step

Read [Architecture](ARCHITECTURE.md) before changing payment, attestation, or suite boundaries.
