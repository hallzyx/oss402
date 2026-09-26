import Link from "next/link";
import { fetchJson } from "../../../lib/api";
import { stellarTestnetTxUrl } from "../../../lib/stellar";
import styles from "./maintainer.module.css";

interface Stats {
  certificationRuns: number;
  passed: number;
  failed: number;
  revenueUSDC: string;
}

interface RunRow {
  runId: string;
  status: string;
  workspace: string;
  commit: string;
  paid: string;
  paymentTx?: string;
  attestationId?: string;
  stellarTx?: string;
  createdAt: string;
}

const STELLAR_TX = /^[a-f0-9]{64}$/i;

export default async function MaintainerPage() {
  let stats: Stats | null = null;
  let runs: RunRow[] = [];
  let error: string | null = null;
  try {
    const [statsResult, runsResult] = await Promise.all([
      fetchJson<Stats>("/api/stats"),
      fetchJson<{ runs: RunRow[] }>("/api/certifications"),
    ]);
    stats = statsResult;
    runs = runsResult.runs;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <section>
      <p className={styles.kicker}>Maintainer</p>
      <h1 className={styles.title}>Odyssey Auth revenue</h1>
      <p className={styles.lede}>
        Official Conformance v1 on Stellar Testnet. Each paid run is 0.05 USDC and includes one
        remediation retry.
      </p>

      {error ? (
        <p className={styles.error}>API offline ({error}). Start pnpm dev:api first.</p>
      ) : stats ? (
        <div className={styles.grid}>
          <Stat label="Certification runs" value={String(stats.certificationRuns)} />
          <Stat label="Passed" value={String(stats.passed)} />
          <Stat label="Failed" value={String(stats.failed)} />
          <Stat label="Revenue" value={`${stats.revenueUSDC} USDC`} accent />
        </div>
      ) : null}

      <p className={styles.note}>
        Payment does not buy a certificate. FAIL still settles. Only PASS writes an attestation.
      </p>

      {stats ? (
        <div className={styles.tableWrap}>
          <h2 className={styles.tableTitle}>Transactions</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Run</th>
                <th>Workspace</th>
                <th>Result</th>
                <th>Paid</th>
                <th>Payment</th>
                <th>Credential</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.runId}>
                  <td>{formatWhen(run.createdAt)}</td>
                  <td>{run.runId}</td>
                  <td>
                    <div>{run.workspace}</div>
                    <div className={styles.muted}>{run.commit}</div>
                  </td>
                  <td className={run.status === "passed" ? styles.pass : styles.fail}>{run.status}</td>
                  <td>{run.paid}</td>
                  <td>{txCell(run.paymentTx)}</td>
                  <td>{credentialCell(run)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function credentialCell(run: RunRow) {
  if (!run.attestationId) {
    return <span className={styles.muted}>—</span>;
  }
  const onChain = run.stellarTx && STELLAR_TX.test(run.stellarTx) ? run.stellarTx : undefined;
  return (
    <div>
      <Link href={`/verify/${run.attestationId}`}>{run.attestationId}</Link>
      <div className={styles.muted}>
        {onChain ? (
          <a className={styles.subLink} href={stellarTestnetTxUrl(onChain)} target="_blank" rel="noreferrer">
            {onChain.slice(0, 10)}…{onChain.slice(-6)}
          </a>
        ) : (
          "Local record"
        )}
      </div>
    </div>
  );
}

function txCell(hash: string | undefined) {
  if (!hash || hash === "pending-x402-settlement") {
    return <span className={styles.muted}>—</span>;
  }
  if (hash === "local-dev-no-chain") {
    return <span className={styles.muted}>Local only</span>;
  }
  if (!STELLAR_TX.test(hash)) return <span className={styles.muted}>—</span>;
  return (
    <a href={stellarTestnetTxUrl(hash)} target="_blank" rel="noreferrer">
      {hash.slice(0, 10)}…{hash.slice(-6)}
    </a>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? styles.accent : styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
