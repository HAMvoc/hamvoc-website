import { site } from "@/content/site";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">{site.name}</div>
        <div className="footer-right">
          {site.github && (
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub ↗
            </a>
          )}
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
