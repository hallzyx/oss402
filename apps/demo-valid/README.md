# demo-valid

[![Odyssey Auth Maintainer Conformant](./oss402-badge.svg)](http://localhost:3000/verify/att_4)

Correctly configured consumer of `odyssey-auth`.

```ts
odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: true,
  enforceRoles: true
});
```

| Check | Result |
| --- | --- |
| Unit tests | PASS |
| Official Odyssey Auth Conformance v1 | 30/30 PASS |
| Maintainer attestation | Issued for this workspace, commit, and configuration hash |

`oss402.yml` requires that certification before production. The paid run costs 0.05 USDC. The badge is not proof of payment. It is proof of PASS.

## OSS402 verification

Open the credential from the badge. With `pnpm dev:api` and `pnpm dev:dashboard`:

| View | URL |
| --- | --- |
| Credential | http://localhost:3000/verify/`{attestationId}` |
| Badge alias | http://localhost:3000/badge/`{attestationId}` |
| Attestation JSON | http://127.0.0.1:8787/api/attestations/`{attestationId}` |
| Dynamic badge SVG | http://127.0.0.1:8787/api/badge/`{attestationId}`.svg |

The committed [`oss402-badge.svg`](./oss402-badge.svg) is a static preview so the README still shows a badge before the API is deployed. A public host uses the same paths:

```md
[![Odyssey Auth Maintainer Conformant](https://YOUR_API/api/badge/att_XXX.svg)](https://YOUR_DASHBOARD/verify/att_XXX)
```

`att_XXX` comes from a PASS run (`oss402_certification_status` or `GET /api/certifications/{runId}`). FAIL never has an id to put here.

How a run is purchased and how the subject is bound: [MCP and Agent Skill](../../docs/MCP_AND_AGENT_SKILL.md) and [Architecture](../../docs/ARCHITECTURE.md).
