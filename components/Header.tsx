import Link from "next/link";
import { site } from "@/content/site";
import { Clock } from "./Clock";
import { HeaderShell } from "./HeaderShell";
import { SectionLink } from "./SectionLink";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <HeaderShell>
      <Link href="/" aria-label={`${site.name} — home`}>
        <Wordmark />
      </Link>
      <nav className="site-nav" aria-label="Sections">
        <SectionLink className="link-u" href="/#people">
          People
        </SectionLink>
        <Link className="link-u" href="/research/">
          Research
        </Link>
      </nav>
      <p className="site-clock">
        <span>{site.place}</span>
        <Clock />
      </p>
    </HeaderShell>
  );
}
