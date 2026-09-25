/**
 * Local helper: create a paid run record and execute the suite without going through x402.
 * Official demos must use pay-certify.ts or MCP purchase against the protected endpoint.
 */
import { loadRepoEnv } from "./env.js";
import path from "node:path";
import { executeCertificationLocally } from "./runner.js";
import { loadStore, nextRunId, saveStore } from "./store.js";

loadRepoEnv();

const workspace = process.argv[2] ?? "apps/demo-valid";
const commit = process.argv[3] ?? "local-dev";
const repository = process.argv[4] ?? "github.com/hallzyx/oss402";

const store = loadStore();
const runId = nextRunId(store);
store.runs.push({
  runId,
  status: "queued",
  repository,
  commit,
  workspace,
  dependency: "odyssey-auth@1.0.0",
  suiteVersion: "v1",
  paid: "0.05 USDC",
  paymentTx: "local-dev-no-chain",
  createdAt: new Date().toISOString(),
});
store.revenueUSDC += 0.05;
saveStore(store);

const result = await executeCertificationLocally(runId);
console.log(JSON.stringify(result, null, 2));
console.log(`workspace path resolved under ${path.resolve("../..", workspace)}`);
process.exit(result.status === "passed" ? 0 : 1);
