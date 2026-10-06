# odyssey-auth-conformance

Official Odyssey Auth Conformance v1. This is the suite a paid OSS402 run executes. Installing `odyssey-auth` does not run it.

| Mode | Cases | Command |
| --- | --- | --- |
| Public | 10 | `pnpm conformance:public:valid` or `:invalid` |
| Full | 30 | `pnpm conformance:full:valid` or `:invalid` |

`apps/demo-valid` passes 30/30. `apps/demo-invalid` exits non-zero with 29/30 and `AUTH-017`. CI treats that non-zero exit as the expected result.

The manifest is `manifest.json`. The case list is [Conformance](../../docs/CONFORMANCE.md).
