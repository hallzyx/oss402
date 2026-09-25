# odyssey-auth

Fictional but functional authentication library used by the OSS402 hackathon demo.

```ts
import { odysseyAuth } from "odyssey-auth";

const auth = odysseyAuth({
  issuer: "oss402-demo",
  rejectExpiredTokens: true,
  enforceRoles: true,
});
```

Open source stays free. Official conformance certification is sold separately through OSS402.
