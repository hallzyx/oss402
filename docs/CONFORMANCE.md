# Odyssey Auth Conformance v1

The official suite is what a paid OSS402 run executes. Installing `odyssey-auth` does not run it. The project's own unit tests do not replace it.

## Quick path

```bash
pnpm conformance:public:valid
pnpm conformance:public:invalid
pnpm conformance:full:valid
pnpm conformance:full:invalid
```

`public` is the slice a downstream project can run itself. `full` is the maintainer run: public cases, private cases, and generated cases. A certification purchase runs `full`.

| Workspace | Public | Full | Report |
| --- | --- | --- | --- |
| `apps/demo-valid` | 10/10 | 30/30 PASS | none |
| `apps/demo-invalid` | 9/10 | 29/30 FAIL | `AUTH-017` Expired token was accepted. |

`pnpm conformance:full:invalid` exits non-zero. CI accepts that run only when the output contains `AUTH-017`. Another failure still fails the job.

## Why unit tests still pass

`apps/demo-invalid` unit tests cover three things:

- login and the profile route with a fresh token;
- a user token rejected on the admin route;
- the health endpoint.

They never present an expired token. The app is built to accept one (`rejectExpiredTokens: false`). Its own tests stay green, and PUB-007 in the official suite does not.

That split is the product claim: a green local suite is not a maintainer attestation.

## How a run is built

The suite reads `oss402.yml` in the workspace and calls the routes in `conformance.mappings`:

| Key | Route |
| --- | --- |
| `health` | `/health` |
| `login` | `/api/login` |
| `loginExpired` | `/api/login-expired` |
| `protected` | `/api/profile` |
| `admin` | `/api/admin` |
| `logout` | `/api/logout` |

`demo-valid` rejects expired tokens. `demo-invalid` accepts them. Both apps use the same library and the same route map. The suite scores the integration, then returns PASS only when every case in the selected mode passes. The first failure becomes `report.code` and `report.message`.

Counts are declared in `packages/odyssey-auth-conformance/manifest.json`:

| Tier | Count | Who runs it |
| --- | ---: | --- |
| Public | 10 | `conformance:public:*` and the paid run |
| Private | 15 | Paid run and `conformance:full:*` only |
| Generated | 5 | Paid run and `conformance:full:*` only |
| Total | 30 | Official certification |

## Public cases

| Id | Case | Failure code when it does not hold |
| --- | --- | --- |
| PUB-001 | Health endpoint responds | — |
| PUB-002 | Login issues a token | — |
| PUB-003 | Valid token accepted on the protected route | — |
| PUB-004 | Missing token rejected | `AUTH-001` |
| PUB-005 | Malformed token rejected | `AUTH-002` |
| PUB-006 | Modified signature rejected | `AUTH-003` |
| PUB-007 | Expired token rejected | `AUTH-017` |
| PUB-008 | User cannot access the admin route | — |
| PUB-009 | Admin can access the admin route | — |
| PUB-010 | User can access the user route | — |

`demo-invalid` fails PUB-007 and passes the other 29 cases in a full run. The certification report therefore cites `AUTH-017`, not a generic test failure.

## Private cases

These run only in `full` mode. They are the maintainer's additional checks: scheme and shape of the credential, role claims, and stability.

| Id | Case |
| --- | --- |
| PRV-001 | Logout endpoint responds |
| PRV-002 | Non-bearer scheme rejected |
| PRV-003 | Empty bearer token rejected |
| PRV-004 | Admin can access the protected user route |
| PRV-005 | Invalid login role rejected |
| PRV-006 | Login returns role claim metadata |
| PRV-007 | Admin login returns the admin role |
| PRV-008 | Two-part JWT rejected |
| PRV-009 | Admin route requires auth |
| PRV-010 | Whitespace-broken bearer rejected |
| PRV-011 | Repeated valid requests remain stable |
| PRV-012 | Protected route returns the subject |
| PRV-013 | Oversized malformed token does not crash |
| PRV-014 | Issuer-bound tokens are issued |
| PRV-015 | Health payload indicates ok |

## Generated cases

| Id | Case |
| --- | --- |
| GEN-001 | Mutated token variant 1 rejected |
| GEN-002 | Mutated token variant 2 rejected |
| GEN-003 | Mutated token variant 3 rejected |
| GEN-004 | Role combination login matrix |
| GEN-005 | Request ordering: health, then login |

## What the suite does not do

- It does not settle USDC. Payment is the API's job. See [x402 and Stellar](X402_STELLAR.md).
- It does not issue an attestation. The API writes one only after a full run returns PASS.
- It does not grade a different commit than the workspace it was given.
- A public 10/10 is not certification. Certification is the full 30/30, paid, and bound to that workspace.

## Related documents

- [Testing](TESTING.md)
- [Architecture](ARCHITECTURE.md)
- [Getting Started](GETTING_STARTED.md)
