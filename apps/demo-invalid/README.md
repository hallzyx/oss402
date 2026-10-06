# demo-invalid

Nearly identical to [`demo-valid`](../demo-valid/README.md), with one deliberate integration error.

```ts
odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: false, // Intentionally wrong.
  enforceRoles: true
});
```

| Check | Result |
| --- | --- |
| Unit tests, build, lint | PASS |
| Official Odyssey Auth Conformance v1 | FAIL `AUTH-017` — expired token was accepted |
| Maintainer attestation | None |

`oss402.yml` still requires certification for production and allows an autonomous purchase up to 0.10 USDC. A paid run settles 0.05 USDC and does not issue a credential URL.

Do not "fix" this app when demonstrating the contrast with `demo-valid`. The official suite is supposed to fail here.

See [Conformance](../../docs/CONFORMANCE.md) for PUB-007, [Testing](../../docs/TESTING.md) for the commands, and [x402 and Stellar](../../docs/X402_STELLAR.md) for a settled FAIL transaction.
