# contracts/oss402-attestation

Minimal Soroban contract for PASS-only maintainer attestations.

## Build

```bash
cd contracts
stellar contract build
```

## Deploy (testnet)

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/oss402_attestation.wasm \
  --source maintainer \
  --network testnet
```

## Attest

```bash
stellar contract invoke \
  --id $ATTESTATION_CONTRACT_ID \
  --source maintainer \
  --network testnet \
  -- \
  attest \
  --issuer $MAINTAINER_STELLAR_ADDRESS \
  --subject_hash $SUBJECT_DIGEST \
  --attestation_id att_1
```

Only call this after an official suite PASS. FAIL must never write an attestation.
