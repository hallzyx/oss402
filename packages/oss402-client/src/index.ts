export interface CertificationService {
  id: string;
  type: "official_conformance";
  maintainer: string;
  price: { amount: string; currency: "USDC" };
  network: "stellar-testnet";
  endpoint: string;
  suiteVersion: string;
  dependency: string;
  dependencyVersion: string;
  includesRetry: boolean;
}

export interface CertificationRun {
  runId: string;
  status: "queued" | "running" | "passed" | "failed";
  repository: string;
  commit: string;
  workspace: string;
  dependency: string;
  suiteVersion: string;
  paid: string;
  paymentTx?: string;
  passed?: number;
  failed?: number;
  total?: number;
  report?: { code: string; message: string };
  attestationId?: string;
  subjectHash?: string;
  configurationHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AttestationRecord {
  attestationId: string;
  runId: string;
  issuer: string;
  repository: string;
  commit: string;
  workspace: string;
  dependency: string;
  dependencyVersion: string;
  suiteVersion: string;
  configurationHash: string;
  subjectHash: string;
  result: "PASS";
  stellarTx?: string;
  timestamp: string;
}

export interface MaintainerStats {
  certificationRuns: number;
  passed: number;
  failed: number;
  revenueUSDC: string;
}

export const ODYSSEY_AUTH_SERVICE: CertificationService = {
  id: "odyssey-auth-conformance-v1",
  type: "official_conformance",
  maintainer: "Odyssey Auth Maintainers",
  price: { amount: "0.05", currency: "USDC" },
  network: "stellar-testnet",
  endpoint: "/api/certifications/odyssey-auth/v1",
  suiteVersion: "v1",
  dependency: "odyssey-auth",
  dependencyVersion: "1.0.0",
  includesRetry: true,
};

export function createSubjectHash(input: {
  repository: string;
  commit: string;
  workspace: string;
  dependency: string;
  dependencyVersion: string;
  suiteVersion: string;
  configurationHash: string;
}): string {
  const payload = [
    input.repository,
    input.commit,
    input.workspace,
    input.dependency,
    input.dependencyVersion,
    input.suiteVersion,
    input.configurationHash,
  ].join("|");
  return `sha256:${simpleHash(payload)}`;
}

export function simpleHash(input: string): string {
  // Deterministic non-crypto hash for demo subject binding. Production would use SHA-256.
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}
