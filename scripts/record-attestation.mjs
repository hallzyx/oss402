#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const attestationId = process.argv[2];
if (!attestationId) {
  console.error("Usage: node scripts/record-attestation.mjs <attestationId>");
  process.exit(1);
}

const storePath = path.resolve("apps/oss402-api/data/store.json");
if (!existsSync(storePath)) {
  console.error("No store at", storePath);
  process.exit(1);
}

const store = JSON.parse(readFileSync(storePath, "utf8"));
const attestation = store.attestations.find((a) => a.attestationId === attestationId);
if (!attestation) {
  console.error("Attestation not found. Run a PASS certification first.");
  process.exit(1);
}

const digest = createHash("sha256").update(attestation.subjectHash).digest("hex");
console.log("Subject digest (sha256 of subjectHash string):", digest);
console.log("Contract id:", process.env.ATTESTATION_CONTRACT_ID ?? "(not deployed)");
console.log(
  "Invoke example:\n  stellar contract invoke --id $ATTESTATION_CONTRACT_ID --network testnet --source maintainer -- attest --issuer $MAINTAINER_STELLAR_ADDRESS --subject_hash",
  digest,
  "--attestation_id",
  attestationId,
);

if (!attestation.stellarTx && process.env.ATTESTATION_TX_HASH) {
  attestation.stellarTx = process.env.ATTESTATION_TX_HASH;
  mkdirSync(path.dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2));
  console.log("Updated local attestation stellarTx");
}
