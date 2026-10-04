"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

const links = [
  ["/", "Home"],
  ["/members/", "Members"],
  ["/research/", "Research"],
] as const;

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.slice(0, -1)));

  return (
    <header className="top-nav">
      <div className="nav-container">
        <div className="brand-wrap">
          <span className="brand-mark" aria-hidden="true" />
          <Link href="/" className="brand-title">
            {site.name}
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="brand-partner"
            src="/swinburne.webp"
            alt="Swinburne University of Technology"
            width={1200}
            height={608}
          />
        </div>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={`nav-link${isActive(href) ? " active" : ""}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
