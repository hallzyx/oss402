# Configuration

OSS402 uses one root `.env` for the API, the payer scripts, and the MCP server. The dashboard also reads `apps/dashboard/.env.local` when that file exists. Copy `.env.example` to `.env` and keep secrets out of source control.

## Settlement configuration

Live Stellar Testnet settlement is the supported demo path:

```dotenv
MAINTAINER_STELLAR_ADDRESS=G...
STELLAR_PRIVATE_KEY=S...
X402_FACILITATOR_URL=https://www.x402.org/facilitator
OSS402_RUN_LOCALLY=1
ATTESTATION_CONTRACT_ID=CAHOYKJPZNQ73XH3WCW7KLKWYT3SIHWL3UNEVTDNIMRQPIQMYBAVBMSI
STELLAR_NETWORK=testnet
STELLAR_IDENTITY=deployer2
```

`STELLAR_PRIVATE_KEY` is the payer. `MAINTAINER_STELLAR_ADDRESS` is the USDC recipient and the attestation issuer. They are not the same role.

Leave `OSS402_RUN_LOCALLY=1` unless you intend to dispatch `.github/workflows/oss402-certification.yml`. Setting it to `0` does not skip payment. It only changes where the suite runs.

## Environment variables

| Variable | Required | Default | Used by | Notes |
| --- | ---: | --- | --- | --- |
| `PORT` | No | `8787` | API | HTTP port |
| `MAINTAINER_STELLAR_ADDRESS` | Yes for paid runs | — | API | `G...` address with a USDC trustline. Also the attestation issuer |
| `STELLAR_PRIVATE_KEY` | Yes to pay | — | MCP, `pay:certify` | Payer secret. Never send it to the dashboard |
| `X402_FACILITATOR_URL` | No | `https://www.x402.org/facilitator` | API, client | x402 facilitator |
| `X402_FACILITATOR_API_KEY` | No | — | API | Only for a facilitator that requires a bearer token |
| `OSS402_RUN_LOCALLY` | No | on, unless `0` | API | In-process suite vs GitHub Actions |
| `OSS402_API_URL` | No | `http://127.0.0.1:8787` | MCP, `pay:certify` | API base URL |
| `OSS402_DATA_DIR` | No | `data` under the API cwd | API | Run ledger directory |
| `NEXT_PUBLIC_OSS402_API_URL` | No | `http://127.0.0.1:8787` | Dashboard | Browser-visible API |
| `NEXT_PUBLIC_OSS402_VERIFY_URL` | No | `http://localhost:3000` | Badge links | Public origin of `/verify/:id` |
| `ATTESTATION_CONTRACT_ID` | For on-chain PASS | — | API | Deployed id in `contracts/deployments.testnet.json` |
| `STELLAR_IDENTITY` | For on-chain PASS | `maintainer` | API | `stellar` CLI identity that signs `attest` |
| `STELLAR_NETWORK` | No | `testnet` | API | Soroban network name |
| `STELLAR_RPC_URL` | No | `https://soroban-testnet.stellar.org` | MCP, payer | RPC used while building the payment |
| `ATTESTATION_TX_HASH` | No | — | API | Fallback hash when no contract write ran |
| `GITHUB_TOKEN` | Remote suite only | — | API | Workflow dispatch |
| `GITHUB_REPOSITORY` | Remote suite only | — | API | `owner/name` |
| `GITHUB_REF_NAME` | No | `main` | API | Ref dispatched to Actions |
| `OSS402_CALLBACK_URL` | Remote suite only | — | API | Where Actions posts the result |
| `OSS402_CALLBACK_SECRET` | No | — | API | `x-oss402-callback-secret` |
| `OSS402_SESSION_SPENT` | No | `0` | MCP | Prior spend counted against the session budget |

## Service-specific configuration

### API

The paid route returns 503 until `MAINTAINER_STELLAR_ADDRESS` is set. Health still responds.

On-chain PASS writes need `ATTESTATION_CONTRACT_ID` and a usable `STELLAR_IDENTITY`. The identity's public key should be the maintainer address that the contract expects as issuer.

### MCP

OpenCode starts `node packages/oss402-mcp/dist/index.js` with `cwd` at the repository root. The process loads `.env` from that directory. If the parent environment sets `STELLAR_PRIVATE_KEY` to an empty string, the MCP still uses the non-empty value from the file.

`opencode.jsonc` should pass `OSS402_API_URL` and should not inject the private key.

Build the server before connecting OpenCode:

```bash
pnpm --filter oss402-client build
pnpm --filter oss402-mcp build
```

### Dashboard

The browser reads `NEXT_PUBLIC_OSS402_API_URL`. Server components in this app read the same variable. Restart the dashboard after changing it.

`apps/dashboard/.env.example` documents the two public URLs. A local override belongs in `apps/dashboard/.env.local`, which is not committed.

### Demo apps

`apps/demo-valid` listens on port 3001. `apps/demo-invalid` listens on port 3002. The suite starts the workspace it was asked to certify. You do not need both apps running before `pay:certify`.

### Project policy

Each demo app has its own `oss402.yml`:

```yaml
certification:
  requiredFor:
    - production
agent:
  totalBudgetUSDC: 1.00
  maxAutonomousPurchaseUSDC: 0.10
```

The skill refuses an autonomous purchase above `maxAutonomousPurchaseUSDC`. The service price is 0.05 USDC, so the demo policy allows it.

## Related documents

- [Getting Started](GETTING_STARTED.md)
- [Security](SECURITY.md)
- [x402 and Stellar](X402_STELLAR.md)
