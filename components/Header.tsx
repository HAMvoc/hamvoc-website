import Link from "next/link";
import { site } from "@/content/site";
import { Clock } from "./Clock";
import { SectionLink } from "./SectionLink";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <header className="site-header label">
      <Link href="/" aria-label={`${site.name} — home`}>
        <Wordmark />
      </Link>
      <nav className="site-nav" aria-label="Sections">
        <SectionLink className="link-u" hash="#people">
          People
        </SectionLink>
        <SectionLink className="link-u" hash="#research">
          Research
        </SectionLink>
        <SectionLink className="link-u" hash="#join">
          Join
        </SectionLink>
      </nav>
      <p className="site-clock">
        <span>{site.place}</span>
        <Clock />
      </p>
    </header>
  );
}
