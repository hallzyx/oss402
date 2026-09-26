import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import { fetchJson } from "../../../lib/api";
import { stellarTestnetAccountUrl, stellarTestnetTxUrl } from "../../../lib/stellar";
import { CredentialSidebar } from "./credential-sidebar";
import styles from "./credential.module.css";

interface Attestation {
  valid?: boolean;
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function VerifyCredentialPage({
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

  const verifyBase = process.env.NEXT_PUBLIC_OSS402_VERIFY_URL ?? "http://localhost:3000";
  const verifyPageUrl = `${verifyBase}/verify/${id}`;

  let attestation: Attestation | null = null;
  try {
    attestation = await fetchJson<Attestation>(
      `/api/attestations/${id}${qs.toString() ? `?${qs}` : ""}`,
    );
  } catch {
    attestation = null;
  }

  if (!attestation) {
    return (
      <div className={styles.notFound}>
        <h1>Credential not found</h1>
        <p>
          No attestation <code>{id}</code>. Run a paid PASS certification or check the API is
          running.
        </p>
      </div>
    );
  }

  const projectName = attestation.workspace.split("/").pop() ?? attestation.workspace;
  const issuerShort = attestation.issuer.startsWith("G")
    ? `${attestation.issuer.slice(0, 4)}…${attestation.issuer.slice(-4)}`
    : attestation.issuer;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.sealWrap}>
          <div className={styles.seal}>
            <SealFrame />
            <div className={styles.sealInner}>
              <div className={styles.sealBrand}>
                <span className={styles.sealMark} aria-hidden />
                OSS402
              </div>
              <span className={styles.sealPill}>Conformance {attestation.suiteVersion}</span>
              <h1 className={styles.sealTitle}>
                {attestation.stale ? "Certification stale" : "Maintainer Conformant"}
              </h1>
              <Zap className={styles.sealBolt} size={26} strokeWidth={2.4} fill="currentColor" aria-hidden />
              <div className={styles.sealMeta}>
                Issued
                <br />
                {formatDate(attestation.timestamp)}
              </div>
            </div>
          </div>
        </div>
        {attestation.stale && attestation.staleReason ? (
          <p className={styles.staleBanner}>{attestation.staleReason}</p>
        ) : null}
      </section>

      <div className={styles.content}>
        <div>
          <div className={styles.issuerRow}>
            <div className={styles.issuerAvatar} aria-hidden>OA</div>
            <div>
              <div className={styles.verifiedChip}>
                <span aria-hidden>✓</span> Verified issuer
              </div>
              <div>
                <a href={stellarTestnetAccountUrl(attestation.issuer)} target="_blank" rel="noreferrer">
                  {issuerShort}
                </a>
              </div>
            </div>
          </div>

          <h2 className={styles.pageTitle}>Odyssey Auth · {projectName}</h2>

          <p className={styles.description}>
            This credential recognizes that <strong>{attestation.workspace}</strong> at commit{" "}
            <strong>{attestation.commit}</strong> passed the official Odyssey Auth Conformance
            suite ({attestation.suiteVersion}) with <strong>{attestation.result}</strong>. The
            attestation is bound to the dependency version, configuration hash, and subject hash
            below — not merely “the library installed”.
          </p>

          <h3 className={styles.sectionLabel}>Skills / scope</h3>
          <div className={styles.tags}>
            <span className={styles.tag}>{attestation.dependency}</span>
            <span className={styles.tag}>v{attestation.dependencyVersion}</span>
            <span className={styles.tag}>Suite {attestation.suiteVersion}</span>
            <span className={styles.tag}>{attestation.workspace}</span>
            <span className={styles.tag}>x402 paid run</span>
          </div>

          <div className={styles.metaGrid}>
            <Meta label="Repository" value={attestation.repository} />
            <Meta label="Commit" value={attestation.commit} />
            <Meta label="Workspace" value={attestation.workspace} />
            <Meta
              label="Stellar tx"
              value={
                attestation.stellarTx
                  ? (
                      <a href={stellarTestnetTxUrl(attestation.stellarTx)} target="_blank" rel="noreferrer">
                        {attestation.stellarTx}
                      </a>
                    )
                  : "Local record (no on-chain tx)"
              }
            />
            <Meta label="Subject hash" value={attestation.subjectHash} />
            <Meta label="Config hash" value={attestation.configurationHash} />
          </div>
        </div>

        <CredentialSidebar
          attestationId={attestation.attestationId}
          issuer={attestation.issuer}
          stellarTx={attestation.stellarTx}
          projectName={projectName}
          verifyPageUrl={verifyPageUrl}
        />
      </div>
    </>
  );
}

function SealFrame() {
  return (
    <svg className={styles.sealSvg} viewBox="0 0 200 200" aria-hidden>
      <defs>
        <linearGradient id="oss402-seal" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#ffe56a" />
          <stop offset="42%" stopColor="#f6c945" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
      </defs>
      <path
        d={wavySealPath(8, 100, 100, 72, 90)}
        fill="#ffffff"
        stroke="url(#oss402-seal)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function wavySealPath(lobes: number, cx: number, cy: number, inner: number, outer: number): string {
  const steps = lobes * 64;
  let path = "";
  for (let i = 0; i <= steps; i += 1) {
    const turn = (i / steps) * Math.PI * 2;
    const blend = (Math.cos(lobes * turn) + 1) / 2;
    const radius = inner + (outer - inner) * blend ** 1.35;
    const x = cx + radius * Math.cos(turn - Math.PI / 2);
    const y = cy + radius * Math.sin(turn - Math.PI / 2);
    path += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${path} Z`;
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.metaRow}>
      <div className={styles.metaLabel}>{label}</div>
      <div className={styles.metaValue}>{value}</div>
    </div>
  );
}
