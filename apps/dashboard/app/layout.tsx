import type { ReactNode } from "react";

export const metadata = {
  title: "OSS402 Dashboard",
  description: "Maintainer certification verification and revenue",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#0b1020",
          color: "#e8eefc",
        }}
      >
        <main style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1.25rem" }}>
          <header style={{ marginBottom: "2rem" }}>
            <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
              OSS402
            </p>
            <h1 style={{ margin: "0.25rem 0" }}>Maintainer Certification</h1>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
