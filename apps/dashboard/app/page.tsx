import Link from "next/link";
import { fetchJson } from "../lib/api";

interface Stats {
  certificationRuns: number;
  passed: number;
  failed: number;
  revenueUSDC: string;
}

export default async function HomePage() {
  let stats: Stats | null = null;
  let error: string | null = null;
  try {
    stats = await fetchJson<Stats>("/api/stats");
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <section>
      <h2>Odyssey Auth</h2>
      <p style={{ opacity: 0.85 }}>
        Official Conformance v1 — pay-per-certification-run on Stellar Testnet.
      </p>

      {error ? (
        <p style={{ color: "#fbbf24" }}>
          API offline ({error}). Start <code>pnpm dev:api</code> first.
        </p>
      ) : stats ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <Stat label="Certification runs" value={String(stats.certificationRuns)} />
          <Stat label="Passed" value={String(stats.passed)} />
          <Stat label="Failed" value={String(stats.failed)} />
          <Stat label="Revenue" value={`${stats.revenueUSDC} USDC`} />
        </div>
      ) : null}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/maintainer" style={{ color: "#93c5fd" }}>
          Maintainer dashboard
        </Link>
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#151b2f",
        border: "1px solid #243056",
        borderRadius: 12,
        padding: "1rem",
      }}
    >
      <div style={{ opacity: 0.65, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}
