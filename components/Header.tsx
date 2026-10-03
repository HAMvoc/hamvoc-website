"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

export function Header() {
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "";
  const isMembers = pathname.startsWith("/members");
  const isResearch = pathname.startsWith("/research");

  return (
    <header className="top-nav">
      <div className="nav-container">
        <div className="brand-wrap">
          <span className="brand-mark" aria-hidden="true" />
          <Link href="/" className="brand-title">
            {site.name}
          </Link>
          <span className="brand-tag">{site.place}</span>
        </div>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <Link href="/" className={`nav-link ${isHome ? "active" : ""}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/members/" className={`nav-link ${isMembers ? "active" : ""}`}>
                Members
              </Link>
            </li>
            <li>
              <Link href="/research/" className={`nav-link ${isResearch ? "active" : ""}`}>
                Research
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
