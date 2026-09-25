import type { CertificationRun } from "oss402-client";
import { maybeWriteOnChainAttestation } from "./attestation-onchain.js";
import { buildSubject, nextAttestationId, type StoreData } from "./store.js";

export interface SuiteOutcome {
  result: "PASS" | "FAIL";
  passed: number;
  failed: number;
  total: number;
  report?: { code: string; message: string };
}

export async function finalizeCertificationRun(
  store: StoreData,
  run: CertificationRun,
  outcome: SuiteOutcome,
): Promise<CertificationRun> {
  run.passed = outcome.passed;
  run.failed = outcome.failed;
  run.total = outcome.total;
  run.completedAt = new Date().toISOString();

  const { configurationHash, subjectHash } = buildSubject({
    repository: run.repository,
    commit: run.commit,
    workspace: run.workspace,
  });
  run.configurationHash = configurationHash;
  run.subjectHash = subjectHash;

  if (outcome.result === "PASS") {
    run.status = "passed";
    const attestationId = nextAttestationId(store);
    run.attestationId = attestationId;

    const stellarTx =
      (await maybeWriteOnChainAttestation(attestationId, subjectHash)) ??
      process.env.ATTESTATION_TX_HASH;

    store.attestations.push({
      attestationId,
      runId: run.runId,
      issuer: process.env.MAINTAINER_STELLAR_ADDRESS ?? "GMAINTAINERPLACEHOLDER",
      repository: run.repository,
      commit: run.commit,
      workspace: run.workspace,
      dependency: "odyssey-auth",
      dependencyVersion: "1.0.0",
      suiteVersion: run.suiteVersion,
      configurationHash,
      subjectHash,
      result: "PASS",
      stellarTx,
      timestamp: new Date().toISOString(),
    });
  } else {
    run.status = "failed";
    run.report = outcome.report;
    run.attestationId = undefined;
  }

  return run;
}
