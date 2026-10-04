import Link from "next/link";
import { site } from "@/content/site";
import { HeaderShell } from "./HeaderShell";
import { SectionLink } from "./SectionLink";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <HeaderShell>
      <div className="site-brand">
        <Link href="/" aria-label={`${site.name} — home`}>
          <Wordmark />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="site-partner"
          src="/swinburne.webp"
          alt="Swinburne University of Technology"
          width={1200}
          height={608}
        />
      </div>
      <nav className="site-nav" aria-label="Sections">
        <SectionLink className="link-u" href="/#people">
          People
        </SectionLink>
        <Link className="link-u" href="/research/">
          Research
        </Link>
      </nav>
    </HeaderShell>
  );
}
