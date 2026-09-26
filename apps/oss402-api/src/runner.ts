import path from "node:path";
import { runConformanceSuite } from "odyssey-auth-conformance";
import type { CertificationRun } from "oss402-client";
import { finalizeCertificationRun } from "./finalize-run.js";
import { resolveRepoRoot } from "./paths.js";
import { loadStore, withStore } from "./store.js";

export async function executeCertificationLocally(runId: string): Promise<CertificationRun> {
  await withStore((store) => {
    const run = store.runs.find((r) => r.runId === runId);
    if (!run) {
      throw new Error(`Unknown run ${runId}`);
    }
    run.status = "running";
  });

  const snapshot = loadStore();
  const pending = snapshot.runs.find((r) => r.runId === runId);
  if (!pending) {
    throw new Error(`Unknown run ${runId}`);
  }

  const repoRoot = resolveRepoRoot();
  const workspacePath = path.resolve(repoRoot, pending.workspace);
  const suite = await runConformanceSuite({
    workspacePath,
    mode: "full",
  });

  return withStore(async (store) => {
    const run = store.runs.find((r) => r.runId === runId);
    if (!run) {
      throw new Error(`Unknown run ${runId}`);
    }
    await finalizeCertificationRun(store, run, {
      result: suite.result,
      passed: suite.passed,
      failed: suite.failed,
      total: suite.total,
      report: suite.report,
    });
    return run;
  });
}
