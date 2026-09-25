import { fetchJson } from "../../../lib/api";

interface Attestation {
  attestationId: string;
  repository: string;
  commit: string;
  workspace: string;
  dependency: string;
  dependencyVersion: string;
  suiteVersion: string;
  configurationHash: string;
  subjectHash: string;
  issuer: string;
  result: string;
  stellarTx?: string;
  timestamp: string;
  stale?: boolean;
  staleReason?: string;
}

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ commit?: string; workspace?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const qs = new URLSearchParams();
  if (query.commit) qs.set("commit", query.commit);
  if (query.workspace) qs.set("workspace", query.workspace);

  let attestation: Attestation | null = null;
  let error: string | null = null;
  try {
    attestation = await fetchJson<Attestation>(
      `/api/attestations/${id}${qs.toString() ? `?${qs}` : ""}`,
    );
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  if (error || !attestation) {
    return (
      <section>
        <h2>Verification</h2>
        <p>Attestation not found.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>ODYSSEY AUTH</h2>
      {attestation.stale ? (
        <p style={{ color: "#fbbf24", fontWeight: 700 }}>⚠ CERTIFICATION STALE</p>
      ) : (
        <p style={{ color: "#4ade80", fontWeight: 700 }}>✓ MAINTAINER CONFORMANT</p>
      )}
      {attestation.staleReason ? <p>{attestation.staleReason}</p> : null}

      <dl style={{ lineHeight: 1.8 }}>
        <Row label="Project" value={attestation.workspace.split("/").pop() ?? attestation.workspace} />
        <Row label="Repository" value={attestation.repository} />
        <Row label="Workspace" value={attestation.workspace} />
        <Row label="Commit" value={attestation.commit} />
        <Row
          label="Dependency"
          value={`${attestation.dependency}@${attestation.dependencyVersion}`}
        />
        <Row label="Suite" value={`Odyssey Auth Conformance ${attestation.suiteVersion}`} />
        <Row label="Result" value={attestation.result} />
        <Row label="Issuer" value={attestation.issuer} />
        <Row label="Subject hash" value={attestation.subjectHash} />
        <Row label="Config hash" value={attestation.configurationHash} />
        <Row label="Stellar attestation" value={attestation.stellarTx ?? "pending / local record"} />
        <Row label="Timestamp" value={attestation.timestamp} />
      </dl>

      <p style={{ marginTop: "1.5rem" }}>
        Badge markdown:
        <br />
        <code>
          {`[![Odyssey Auth Conformant](${process.env.NEXT_PUBLIC_OSS402_API_URL ?? "http://127.0.0.1:8787"}/api/badge/${id}.svg)](/verify/${id})`}
        </code>
      </p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ opacity: 0.65 }}>{label}</dt>
      <dd style={{ margin: "0 0 0.75rem" }}>{value}</dd>
    </>
  );
}
