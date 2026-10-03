import { site } from "@/content/site";
import { FooterMark } from "./FooterMark";
import { Reveal } from "./Reveal";
import { SectionLink } from "./SectionLink";

export function Footer() {
  return (
    <footer id="join" className="site-footer">
      <div className="join">
        <Reveal as="p" className="join-q">
          Can&rsquo;t leave things alone either?
        </Reveal>
        <p className="join-body">
          Tell us what you&rsquo;ve been poking at lately — a paper you couldn&rsquo;t put down, a thing you took
          apart, a bug you chased for a week. Write to{" "}
          <a className="link-u" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
        <div className="join-links label">
          <a className="link-u" href={`mailto:${site.email}`}>
            Email
          </a>
          <a className="link-u" href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <FooterMark />

      <div className="footer-bottom label">
        <span>
          © {new Date().getFullYear()} <span className="nocase">{site.name}</span>
        </span>
        <span>{site.place}</span>
        <SectionLink className="link-u" hash="#top">
          Back to top
        </SectionLink>
      </div>
    </footer>
  );
}
