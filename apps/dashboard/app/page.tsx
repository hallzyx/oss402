import Link from "next/link";
import { ArrowRight, BadgeCheck, Ban, Zap } from "lucide-react";
import { SiteHeader } from "./site-header";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <SiteHeader ctaHref="/verify/att_4" ctaLabel="See a credential" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Stellar Testnet · x402 · Odyssey Auth</p>
          <h1>
            AI uses upstream.
            <br />
            <em>AI pays upstream.</em>
          </h1>
          <p className={styles.lede}>
            Open source stays free. An agent pays 0.05 USDC for an official conformance run of the
            exact build it is about to ship. PASS issues a maintainer attestation. FAIL does not.
          </p>
          <div className={styles.actions}>
            <Link href="/verify/att_4" className={styles.primary}>
              Open a live badge <ArrowRight size={18} />
            </Link>
            <Link href="/maintainer" className={styles.secondary}>
              Maintainer revenue
            </Link>
          </div>
        </div>
        <div className={styles.heroSeal} aria-hidden>
          <div className={styles.sealRing}>
            <Zap size={28} strokeWidth={2.4} fill="currentColor" />
            <strong>Maintainer Conformant</strong>
            <span>0.05 USDC / run</span>
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div>
          <p className={styles.kicker}>The product</p>
          <h2>Payment buys a run, not a certificate.</h2>
        </div>
        <p>
          The suite is the maintainer’s. The subject is the project’s commit, workspace, dependency
          version, and configuration hash. A green unit-test suite is not the same thing.
        </p>
      </section>

      <section className={styles.split}>
        <article className={styles.fail}>
          <Ban size={22} />
          <p className={styles.kicker}>demo-invalid</p>
          <h3>29 / 30 · AUTH-017</h3>
          <p>Expired token was accepted. The run is paid. No attestation is issued.</p>
        </article>
        <article className={styles.pass}>
          <BadgeCheck size={22} />
          <p className={styles.kicker}>demo-valid</p>
          <h3>30 / 30 · PASS</h3>
          <p>Same library, same suite. A version-bound credential lands on Stellar and on the badge.</p>
        </article>
      </section>

      <section className={styles.steps}>
        <h2>What the agent does</h2>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Detect</strong>
              <p>Production policy requires official Odyssey Auth conformance.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Pay</strong>
              <p>x402 settles 0.05 USDC to the maintainer on Stellar Testnet.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Attest</strong>
              <p>Only a PASS writes the credential the README badge can point to.</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
