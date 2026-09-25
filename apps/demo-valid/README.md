# demo-valid

[![Odyssey Auth Maintainer Conformant](./oss402-badge.svg)](#oss402-verification)

Correctly configured consumer of `odyssey-auth`.

```ts
odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: true,
  enforceRoles: true
});
```

Expected official certification: **PASS**.

## OSS402 verification

This badge is shown after an official **Odyssey Auth Conformance v1** run returns **30/30 PASS** and a maintainer attestation is issued (see [PRD §27](https://github.com/hallzyx/oss402/blob/main/docs/PRD.md#27-readme-badge)).

| View | Local (with `pnpm dev:api` + `pnpm dev:dashboard`) |
| --- | --- |
| Verification page | http://localhost:3000/verify/`{attestationId}` |
| Attestation JSON | http://127.0.0.1:8787/api/attestations/`{attestationId}` |
| Dynamic badge SVG | http://127.0.0.1:8787/api/badge/`{attestationId}`.svg |

When the OSS402 API is on a public HTTPS host, use the same paths on that host so the badge renders on GitHub:

```md
[![Odyssey Auth Maintainer Conformant](https://YOUR_API/api/badge/att_XXX.svg)](https://YOUR_DASHBOARD/verify/att_XXX)
```

Replace `att_XXX` with the id from your PASS run (`oss402_certification_status` / `GET /api/certifications/{runId}`).

The committed [`oss402-badge.svg`](./oss402-badge.svg) mirrors the API badge for README preview on GitHub before you deploy the API.
