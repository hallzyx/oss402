# dashboard

Public Next.js app for the certification result. It does not hold a signing key and it does not decide PASS or FAIL. It reads the API.

```bash
pnpm dev:dashboard
```

| Route | What it shows |
| --- | --- |
| `/` | Landing |
| `/maintainer` | Revenue and the run table. Payment links to the USDC transaction. |
| `/verify/[id]` | PASS credential |
| `/badge/[id]` | Redirects to `/verify/[id]` |

`NEXT_PUBLIC_OSS402_API_URL` defaults to http://127.0.0.1:8787. Restart the dev server after changing it.

Screens and the ledger columns: [Operations](../../docs/OPERATIONS.md).
