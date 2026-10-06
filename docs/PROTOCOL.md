# Protocol

This is the contract an agent reads before it pays. Product decisions stay in [PRD](PRD.md). Case-by-case suite behavior stays in [Conformance](CONFORMANCE.md).

## Quick path

1. Read `oss402.yml` in the workspace.
2. Discover `odyssey-auth-conformance-v1`.
3. Buy one run at `POST /api/certifications/odyssey-auth/v1`.
4. Poll `GET /api/certifications/{runId}` until `passed` or `failed`.
5. On `passed`, open `/verify/{attestationId}`. On `failed`, stop. There is no attestation id.

## Project policy (`oss402.yml`)

Each certified workspace has this file. The demo copies differ in `project.id`, the app port, and the auth integration. The policy fields are the same.

```yaml
project:
  id: demo-valid            # demo-invalid on the failing app

environment:
  target: production

runtime:
  install: pnpm install --frozen-lockfile
  build: pnpm --filter demo-valid build
  start: pnpm --filter demo-valid start
  port: 3001

dependency:
  name: odyssey-auth
  version: 1.0.0

conformance:
  baseUrl: http://127.0.0.1:3001
  mappings:
    login: /api/login
    loginExpired: /api/login-expired
    protected: /api/profile
    admin: /api/admin
    logout: /api/logout
    health: /health

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

| Field | Meaning |
| --- | --- |
| `environment.target` | Compared with `certification.requiredFor`. `production` means the agent must buy a run before claiming the build is ready. |
| `dependency` | The free library and version the suite is written for. |
| `conformance.mappings` | Routes the official suite calls. |
| `dependencies.odyssey-auth.certification` | `required` means a green unit-test run is not enough. |
| `agent.maxAutonomousPurchaseUSDC` | Highest price the agent may pay without a new approval. The service costs 0.05, under the 0.10 cap. |
| `agent.totalBudgetUSDC` | Session ceiling. The demo cap is 1.00. |

`workspace` in every purchase is the repo-relative directory that contains this file: `apps/demo-valid` or `apps/demo-invalid`.

## Service catalog

| | |
| --- | --- |
| Manifest | `GET /.well-known/oss402.json` |
| List | `GET /api/services?dependency=odyssey-auth` |
| Inspect | `GET /api/services/odyssey-auth-conformance-v1` |
| Service id | `odyssey-auth-conformance-v1` |
| Price | 0.05 USDC on Stellar Testnet |
| Includes | Initial attempt and one remediation retry |
| Attestation | Issued only when the full suite returns PASS |

Inspect returns `attestationOnPass: true` and `resultType: "PASS_FAIL"`.

## Buy a run

```http
POST /api/certifications/odyssey-auth/v1
Content-Type: application/json

{
  "repository": "github.com/hallzyx/oss402",
  "commit": "<sha-or-label>",
  "workspace": "apps/demo-valid",
  "dependency": "odyssey-auth@1.0.0"
}
```

The first call has no payment signature. The API answers 402 with an x402 exact challenge for 0.05 USDC, network `stellar:testnet`, paid to `MAINTAINER_STELLAR_ADDRESS`.

The buyer retries the same body with the payment signature. After settlement the API responds:

```json
{
  "runId": "cert_8",
  "status": "queued",
  "paid": "0.05 USDC"
}
```

The settlement hash is the `PAYMENT-RESPONSE` header, not a field of that JSON. The stored run copies it into `paymentTx`.

`repository`, `commit`, and `workspace` are required. A missing payer key fails before a run exists.

## Poll the result

```http
GET /api/certifications/{runId}
```

`status` moves `queued` → `running` → `passed` or `failed`.

Both finished runs include `passed`, `failed`, `total`, `paymentTx`, `subjectHash`, and `configurationHash`.

| | PASS | FAIL |
| --- | --- | --- |
| `status` | `passed` | `failed` |
| `attestationId` | `att_N` | absent |
| `report` | absent | `{ "code": "AUTH-017", "message": "Expired token was accepted." }` on `demo-invalid` |
| USDC | 0.05 settled | 0.05 settled |
| Credential URL | `http://localhost:3000/verify/att_N` | none |

`demo-valid` finishes `30` passed, `0` failed, `total` 30. `demo-invalid` finishes `29` / `1` / `30`.

## Read an attestation

```http
GET /api/attestations/{attestationId}
GET /api/attestations/lookup?workspace=apps/demo-valid&commit=<sha>
```

A matching attestation returns `valid: true`. If the query commit or workspace differs, `stale: true`. Stale means this build is outside the credential. It does not mean the suite failed.

Lookup with no matching PASS returns `certified: false`.

The subject hash binds repository, commit, workspace, dependency name and version, suite version, and configuration hash. The USDC `paymentTx` and the Soroban `stellarTx` are different transactions.

## Agent tools

The MCP server wraps the HTTP contract. Arguments and the PASS/FAIL wording the agent must print are in [MCP and Agent Skill](MCP_AND_AGENT_SKILL.md).

| Tool | HTTP it uses |
| --- | --- |
| `oss402_discover` | `GET /api/services` |
| `oss402_inspect` | `GET /api/services/{serviceId}` |
| `oss402_purchase_certification` | `POST /api/certifications/odyssey-auth/v1` |
| `oss402_certification_status` | `GET /api/certifications/{runId}` |
| `oss402_verify_attestation` | `GET /api/attestations/{attestationId}` |

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Conformance](CONFORMANCE.md)
- [x402 and Stellar](X402_STELLAR.md)
- [Configuration](CONFIGURATION.md)
