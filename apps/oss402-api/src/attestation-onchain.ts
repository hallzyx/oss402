import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function subjectDigestHex(subjectHash: string): string {
  return createHash("sha256").update(subjectHash, "utf8").digest("hex");
}

/**
 * Optional Soroban write after PASS. Requires a deployed `oss402-attestation` contract
 * and a configured Stellar CLI identity (see contracts/oss402-attestation/README.md).
 */
export async function maybeWriteOnChainAttestation(
  attestationId: string,
  subjectHash: string,
): Promise<string | undefined> {
  const contractId = process.env.ATTESTATION_CONTRACT_ID;
  const identity = process.env.STELLAR_IDENTITY ?? "maintainer";
  const issuer = process.env.MAINTAINER_STELLAR_ADDRESS;
  const network = process.env.STELLAR_NETWORK ?? "testnet";

  if (!contractId || !issuer) {
    return undefined;
  }

  const digest = subjectDigestHex(subjectHash);

  try {
    const { stdout, stderr } = await execFileAsync(
      "stellar",
      [
        "contract",
        "invoke",
        "--id",
        contractId,
        "--source-account",
        identity,
        "--network",
        network,
        "--send=yes",
        "--",
        "attest",
        "--issuer",
        issuer,
        "--subject_hash",
        digest,
        "--attestation_id",
        attestationId,
      ],
      { timeout: 120_000, maxBuffer: 2 * 1024 * 1024 },
    );
    const combined = `${stdout}\n${stderr}`;
    const txMatch =
      combined.match(/explorer\/testnet\/tx\/([a-f0-9]{64})/i) ??
      combined.match(/Signing transaction:\s*([a-f0-9]{64})/i);
    return txMatch?.[1] ?? "soroban-attest-ok";
  } catch (error) {
    console.warn(
      "[oss402-api] on-chain attestation skipped:",
      error instanceof Error ? error.message : error,
    );
    return undefined;
  }
}
