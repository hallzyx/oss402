import path from "node:path";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import {
  ODYSSEY_AUTH_SERVICE,
  createSubjectHash,
  simpleHash,
  type AttestationRecord,
  type CertificationRun,
  type MaintainerStats,
} from "oss402-client";
import { resolveDataDir } from "./paths.js";

export interface StoreData {
  runs: CertificationRun[];
  attestations: AttestationRecord[];
  revenueUSDC: number;
}

const storePath = path.join(resolveDataDir(), "store.json");

function emptyStore(): StoreData {
  return { runs: [], attestations: [], revenueUSDC: 0 };
}

export function loadStore(): StoreData {
  mkdirSync(path.dirname(storePath), { recursive: true });
  if (!existsSync(storePath)) {
    const initial = emptyStore();
    writeFileSync(storePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(storePath, "utf8")) as StoreData;
}

export function saveStore(store: StoreData) {
  mkdirSync(path.dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

let storeQueue: Promise<unknown> = Promise.resolve();

export function withStore<T>(mutator: (store: StoreData) => T | Promise<T>): Promise<T> {
  const run = storeQueue.then(async () => {
    const store = loadStore();
    const result = await mutator(store);
    saveStore(store);
    return result;
  });
  storeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function nextRunId(store: StoreData): string {
  return `cert_${store.runs.length + 1}`;
}

export function nextAttestationId(store: StoreData): string {
  return `att_${store.attestations.length + 1}`;
}

export function getManifest(payTo: string) {
  return {
    schemaVersion: "0.1",
    project: {
      name: "odyssey-auth",
      version: "1.0.0",
    },
    maintainer: {
      name: ODYSSEY_AUTH_SERVICE.maintainer,
      stellarAddress: payTo,
    },
    certifications: [
      {
        id: ODYSSEY_AUTH_SERVICE.id,
        type: ODYSSEY_AUTH_SERVICE.type,
        price: {
          amount: ODYSSEY_AUTH_SERVICE.price.amount,
          currency: ODYSSEY_AUTH_SERVICE.price.currency,
          network: ODYSSEY_AUTH_SERVICE.network,
        },
        endpoint: ODYSSEY_AUTH_SERVICE.endpoint,
        includes: {
          initialAttempt: true,
          remediationRetry: 1,
        },
      },
    ],
  };
}

export function getStats(store: StoreData): MaintainerStats {
  return {
    certificationRuns: store.runs.length,
    passed: store.runs.filter((r) => r.status === "passed").length,
    failed: store.runs.filter((r) => r.status === "failed").length,
    revenueUSDC: store.revenueUSDC.toFixed(2),
  };
}

export function configurationHashForWorkspace(workspace: string): string {
  if (workspace.includes("demo-invalid")) {
    return `sha256:${simpleHash("rejectExpiredTokens=false|enforceRoles=true")}`;
  }
  return `sha256:${simpleHash("rejectExpiredTokens=true|enforceRoles=true")}`;
}

export function buildSubject(input: {
  repository: string;
  commit: string;
  workspace: string;
}) {
  const configurationHash = configurationHashForWorkspace(input.workspace);
  const subjectHash = createSubjectHash({
    repository: input.repository,
    commit: input.commit,
    workspace: input.workspace,
    dependency: "odyssey-auth",
    dependencyVersion: "1.0.0",
    suiteVersion: "v1",
    configurationHash,
  });
  return { configurationHash, subjectHash };
}

export function findAttestationForSubject(
  store: StoreData,
  input: { workspace: string; commit: string },
): AttestationRecord | undefined {
  return store.attestations.find(
    (a) =>
      a.workspace === input.workspace &&
      a.commit === input.commit &&
      a.result === "PASS",
  );
}
