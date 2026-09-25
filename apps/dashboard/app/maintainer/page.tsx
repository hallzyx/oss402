import { fetchJson } from "../../lib/api";

interface Stats {
  certificationRuns: number;
  passed: number;
  failed: number;
  revenueUSDC: string;
}

export default async function MaintainerPage() {
  const stats = await fetchJson<Stats>("/api/stats");

  return (
    <section>
      <h2>ODYSSEY AUTH</h2>
      <p>Official Conformance v1</p>
      <ul>
        <li>Certification runs: {stats.certificationRuns}</li>
        <li>Passed: {stats.passed}</li>
        <li>Failed: {stats.failed}</li>
        <li>Revenue: {stats.revenueUSDC} USDC</li>
      </ul>
      <p style={{ opacity: 0.75 }}>
        Each run costs 0.05 USDC and includes one remediation retry. Payment does not buy a
        certificate.
      </p>
    </section>
  );
}
