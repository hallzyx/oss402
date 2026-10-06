# oss402-client

Shared types for a certification service, a run, and a PASS attestation. The API and the MCP server both import this package so the price, the subject hash, and the settlement field stay in one place.

```bash
pnpm --filter oss402-client build
```

`transactionHashFromPaymentResponseHeaders` reads the Stellar settlement hash from the x402 `PAYMENT-RESPONSE` header. `createSubjectHash` binds repository, commit, workspace, dependency, suite version, and configuration hash.

Field list: [Protocol](../../docs/PROTOCOL.md).
