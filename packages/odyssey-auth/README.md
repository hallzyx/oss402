# odyssey-auth

Free authentication library used as the OSS402 reference dependency. Installing it does not require a payment.

```ts
import { odysseyAuth } from "odyssey-auth";

const auth = odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: true,
  enforceRoles: true,
});
```

Official conformance is a separate maintainer service, `odyssey-auth-conformance-v1`, priced at 0.05 USDC per run on Stellar Testnet. The suite lives in `packages/odyssey-auth-conformance`. Reference integrations:

| App | `rejectExpiredTokens` | Official suite |
| --- | --- | --- |
| `apps/demo-valid` | `true` | PASS |
| `apps/demo-invalid` | `false` | FAIL `AUTH-017` |

Certification flow: [Architecture](../../docs/ARCHITECTURE.md).
