# Expected results

These baselines do not require a payment. Commands are in [Testing](../../docs/TESTING.md).

## demo-valid

```text
Unit tests        PASS
Official suite    30 / 30 PASS
Attestation       issued only after a certification run records PASS
```

## demo-invalid

```text
Unit tests        PASS
Official suite    29 / 30 FAIL
Failure           AUTH-017 Expired token was accepted.
Attestation       none
```

A paid FAIL still settles 0.05 USDC. A paid PASS settles the same amount and then writes the attestation. See [x402 and Stellar](../../docs/X402_STELLAR.md).
