"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const trim = (p: string) => p.replace(/\/+$/, "") || "/";

/**
 * Link to a section ("/#people", "/research/#vision", "#top"). Scrolls smoothly
 * when the section is on the current page, navigates otherwise.
 */
export function SectionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [path, hash = ""] = href.split("#");
  const samePage = !path || trim(path) === trim(pathname);

  if (!samePage || !hash) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={`#${hash}`}
      className={className}
      onClick={(e) => {
        const target = hash === "top" ? 0 : document.getElementById(hash);
        if (target === null) return;
        e.preventDefault();
        if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
        else target.scrollIntoView({ behavior: "smooth" });
        if (hash !== "top") history.replaceState(history.state, "", `#${hash}`);
      }}
    >
      {children}
    </a>
  );
}
