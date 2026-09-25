import { loadRepoEnv } from "./env.js";
import { Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { x402Client, x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer, getNetworkPassphrase } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { transactionHashFromPaymentResponseHeaders } from "oss402-client";

loadRepoEnv();

const workspace = process.argv[2] ?? "apps/demo-valid";
const commit = process.argv[3] ?? "local-dev";
const repository = process.argv[4] ?? "github.com/hallzyx/oss402";
const API_BASE = process.env.OSS402_API_URL ?? "http://127.0.0.1:8787";
const NETWORK = "stellar:testnet";
const ENDPOINT = "/api/certifications/odyssey-auth/v1";
const privateKey = process.env.STELLAR_PRIVATE_KEY;

if (!privateKey) {
  console.error("Set STELLAR_PRIVATE_KEY in .env");
  process.exit(1);
}

const url = `${API_BASE}${ENDPOINT}`;
const signer = createEd25519Signer(privateKey, NETWORK);
const rpcUrl = process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
const client = new x402Client().register(
  "stellar:*",
  new ExactStellarScheme(signer, { url: rpcUrl }),
);
const httpClient = new x402HTTPClient(client);
const body = JSON.stringify({
  repository,
  commit,
  workspace,
  dependency: "odyssey-auth@1.0.0",
});

console.log("POST", url);
const first = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body,
});
console.log("First response:", first.status);
if (first.status !== 402) {
  console.error(await first.text());
  process.exit(1);
}

const paymentRequired = httpClient.getPaymentRequiredResponse((name) => first.headers.get(name));
let paymentPayload = await client.createPaymentPayload(paymentRequired);
const networkPassphrase = getNetworkPassphrase(NETWORK);
const txXdr = String(paymentPayload.payload.transaction);
const tx = new Transaction(txXdr, networkPassphrase);
const sorobanData = tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData();
if (sorobanData) {
  paymentPayload = {
    ...paymentPayload,
    payload: {
      ...paymentPayload.payload,
      transaction: TransactionBuilder.cloneFrom(tx, {
        fee: "1",
        sorobanData,
        networkPassphrase,
      })
        .build()
        .toXDR(),
    },
  };
}

const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
const paid = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json", ...paymentHeaders },
  body,
});
const json = (await paid.json()) as { runId?: string };
const transactionHash = transactionHashFromPaymentResponseHeaders((name) =>
  paid.headers.get(name),
);
console.log(
  "Paid response:",
  paid.status,
  JSON.stringify({ ...json, transactionHash }, null, 2),
);
if (!paid.ok || !json.runId) process.exit(1);

for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  const statusRes = await fetch(`${API_BASE}/api/certifications/${json.runId}`);
  const status = await statusRes.json();
  console.log("Status:", status.status, status.passed, "/", status.total);
  if (status.status === "passed" || status.status === "failed") {
    console.log(JSON.stringify(status, null, 2));
    process.exit(status.status === "passed" ? 0 : 1);
  }
}
console.error("Timed out waiting for certification");
process.exit(1);
