import type { ReactNode } from "react";
import { SiteHeader } from "../site-header";
import styles from "./verify-layout.module.css";

export const metadata = {
  title: "OSS402 — Credential verification",
};

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <SiteHeader ctaHref="/maintainer" ctaLabel="Maintainer" />
      {children}
    </div>
  );
}
