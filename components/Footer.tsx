import { site } from "@/content/site";
import { FooterMark } from "./FooterMark";
import { SectionLink } from "./SectionLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <FooterMark />
      <div className="footer-bottom label">
        <span>
          © {new Date().getFullYear()} <span className="nocase">{site.name}</span>
        </span>
        <span>{site.place}</span>
        <a className="link-u" href={site.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <SectionLink className="link-u" href="#top">
          Back to top
        </SectionLink>
      </div>
    </footer>
  );
}
