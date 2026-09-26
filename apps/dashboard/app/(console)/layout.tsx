import type { ReactNode } from "react";
import { SiteHeader } from "../site-header";

export const metadata = {
  title: "OSS402 — Maintainer",
};

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f5" }}>
      <SiteHeader ctaHref="/verify/att_4" ctaLabel="See a credential" />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "2.5rem 1.25rem 4rem" }}>
        {children}
      </main>
    </div>
  );
}
