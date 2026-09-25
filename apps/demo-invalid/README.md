# demo-invalid

Nearly identical to `demo-valid`, with one deliberate integration error.

```ts
odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: false, // Intentionally wrong for the demo.
  enforceRoles: true
});
```

Unit tests / build / lint: **PASS**  
Official Odyssey Auth Conformance: **FAIL** (`AUTH-017` — Expired token was accepted.)
