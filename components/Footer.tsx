import { site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-brand">{site.name}</div>
          <div className="footer-desc">{site.description}</div>
        </div>
        <div className="footer-right">
          <div className="footer-badge">
            <span className="footer-dot" aria-hidden="true" />
            <span>{site.place}</span>
          </div>
          {site.github && (
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub ↗
            </a>
          )}
          <span>© {year} {site.name}</span>
        </div>
      </div>
    </footer>
  );
}
