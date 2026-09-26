import Link from "next/link";
import styles from "./site-header.module.css";

export function SiteHeader({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden />
        OSS402
      </Link>
      <nav className={styles.nav}>
        <Link href="/verify/att_4">Credential</Link>
        <Link href="/maintainer">Maintainer</Link>
        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel}
        </Link>
      </nav>
    </header>
  );
}
