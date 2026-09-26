"use client";

import { useState } from "react";
import styles from "./credential.module.css";
import { stellarTestnetTxUrl } from "../../../lib/stellar";

interface CredentialSidebarProps {
  attestationId: string;
  issuer: string;
  stellarTx?: string;
  projectName: string;
  verifyPageUrl: string;
}

export function CredentialSidebar({
  attestationId,
  issuer,
  stellarTx,
  projectName,
  verifyPageUrl,
}: CredentialSidebarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState<"tx" | "link" | null>(null);

  async function copy(value: string, kind: "tx" | "link") {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.shareCard}>
          <h3>Share credential</h3>
          <p>Show this attestation in your repository or documentation.</p>
          <div className={styles.shareActions}>
            <button type="button" className={styles.shareBtn} onClick={() => copy(verifyPageUrl, "link")}>
              {copied === "link" ? "OK" : "URL"}
            </button>
            {stellarTx ? (
              <a className={styles.shareBtn} href={stellarTestnetTxUrl(stellarTx)} target="_blank" rel="noreferrer" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>
                TX
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.verifyCard}>
          <h3>Credential verification</h3>
          <div className={styles.verifyLine}>
            <span className={styles.check} aria-hidden>✓</span>
            <span>
              This credential is from a <strong>verified issuer</strong> on Stellar Testnet.
            </span>
          </div>
          <div className={styles.verifyLine}>
            <span className={styles.check} aria-hidden>✓</span>
            <span>
              {stellarTx ? (
                <>
                  Protected by blockchain.{" "}
                  <button type="button" className={styles.linkBtn} onClick={() => copy(stellarTx, "tx")}>
                    {copied === "tx" ? "Copied" : "Copy ID"}
                  </button>
                </>
              ) : (
                "On-chain write pending. The local certification record is valid."
              )}
            </span>
          </div>
          <button type="button" className={styles.verifyButton} onClick={() => setModalOpen(true)}>
            Verify credential
          </button>
        </div>

        <div className={styles.verifyCard}>
          <h3 className={styles.issuerCardTitle}>
            <span className={styles.issuerAvatar} style={{ width: 28, height: 28, fontSize: "0.65rem" }} aria-hidden>
              OA
            </span>
            Issuer
          </h3>
          <p className={styles.issuerAddress}>{issuer}</p>
          <p className={styles.issuerBlurb}>Odyssey Auth maintainers · official conformance suite v1</p>
        </div>
      </aside>

      {modalOpen ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="verify-modal-title" onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalBadge} aria-hidden>✓</div>
            <h2 id="verify-modal-title">
              This credential <strong>{projectName}</strong> is VERIFIED
            </h2>
            <p className={styles.modalLead}>
              Issued through an official OSS402 certification run. The bound build matches this attestation.
            </p>
            <ul className={styles.modalList}>
              <li>
                <span className={styles.check} aria-hidden>✓</span>
                <span>The issuer is an OSS402 maintainer on Stellar Testnet.</span>
              </li>
              <li>
                <span className={styles.check} aria-hidden>✓</span>
                <span>The credential is bound to workspace, commit, and configuration hash.</span>
              </li>
              <li>
                <span className={styles.check} aria-hidden>✓</span>
                <span>
                  Attestation ID: {attestationId}
                  {stellarTx ? (
                    <a className={styles.hash} href={stellarTestnetTxUrl(stellarTx)} target="_blank" rel="noreferrer">
                      {stellarTx}
                    </a>
                  ) : null}
                </span>
              </li>
            </ul>
            <button type="button" className={styles.verifyButton} onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
