import path from "node:path";
import { runConformanceSuite } from "odyssey-auth-conformance";
import type { CertificationRun } from "oss402-client";
import { finalizeCertificationRun } from "./finalize-run.js";
import { resolveRepoRoot } from "./paths.js";
import { loadStore, saveStore } from "./store.js";

export async function executeCertificationLocally(runId: string): Promise<CertificationRun> {
  const store = loadStore();
  const run = store.runs.find((r) => r.runId === runId);
  if (!run) {
    throw new Error(`Unknown run ${runId}`);
  }

  run.status = "running";
  saveStore(store);

  const repoRoot = resolveRepoRoot();
  const workspacePath = path.resolve(repoRoot, run.workspace);
  const suite = await runConformanceSuite({
    workspacePath,
    mode: "full",
  });

  await finalizeCertificationRun(store, run, {
    result: suite.result,
    passed: suite.passed,
    failed: suite.failed,
    total: suite.total,
    report: suite.report,
  });

  saveStore(store);
  return run;
}
