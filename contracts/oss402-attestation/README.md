# contracts/oss402-attestation

Soroban contract that stores a PASS attestation. The API calls `attest` only after the official suite returns PASS. A FAIL must not be written here.

## Deployed on Stellar Testnet

| Field | Value |
| --- | --- |
| Contract | `CAHOYKJPZNQ73XH3WCW7KLKWYT3SIHWL3UNEVTDNIMRQPIQMYBAVBMSI` |
| Deploy transaction | `476a836d8a3f01a4109096baa98147be833c0b6f4931f46d5655b9f3bc08d0b8` |
| Explorer | https://stellar.expert/explorer/testnet/contract/CAHOYKJPZNQ73XH3WCW7KLKWYT3SIHWL3UNEVTDNIMRQPIQMYBAVBMSI |

The same record is in `contracts/deployments.testnet.json`. Point the API at it with `ATTESTATION_CONTRACT_ID`.

The USDC payment for a run is a different transaction from the `attest` invocation. Both are listed in [x402 and Stellar](../../docs/X402_STELLAR.md).

## Build

```bash
cd contracts
stellar contract build
```

## Deploy

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

The running API performs this call from `apps/oss402-api` after PASS. Invoking it by hand for a build that did not pass the suite is outside the protocol.
