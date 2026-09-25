# OSS402 Certification Skill

Use this workflow when a project declares an OSS402 certification requirement.

1. Finish normal implementation work.
2. Run the project's own tests.
3. Read `oss402.yml`.
4. Detect whether the target environment requires official conformance.
5. Detect whether a valid attestation already exists for the current workspace/commit.
6. Discover available maintainer certification services with `oss402_discover`.
7. Inspect price, suite version and dependency compatibility with `oss402_inspect`.
8. Check the project's autonomous procurement policy (`agent.maxAutonomousPurchaseUSDC`).
9. If the certification is required and the price is within policy, purchase the certification run with `oss402_purchase_certification`.
10. Never interpret payment as proof of certification.
11. Poll `oss402_certification_status` until PASS or FAIL.
12. On FAIL:
    - read the conformance report,
    - explain the problem,
    - propose or implement a fix when allowed.
13. On PASS:
    - verify the attestation with `oss402_verify_attestation`,
    - offer to add/update the README badge (opt-in unless automation policy allows it).
14. Never claim a different commit/workspace is certified.
15. Never claim a stale attestation covers the current build.

## Pricing note

`odyssey-auth-conformance-v1` costs **0.05 USDC** on Stellar Testnet and includes:

- the initial certification attempt
- 1 remediation retry

## Demo workspaces

| Workspace | Expected official result |
| --- | --- |
| `apps/demo-valid` | PASS + attestation |
| `apps/demo-invalid` | FAIL `AUTH-017` (no attestation) |
