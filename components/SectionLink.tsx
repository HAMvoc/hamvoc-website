"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { smooth } from "@/lib/lenis";

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
        if (smooth.lenis) smooth.lenis.scrollTo(target, { duration: 1.6 });
        else if (target === 0) window.scrollTo({ top: 0 });
        else target.scrollIntoView();
        if (hash !== "top") history.replaceState(history.state, "", `#${hash}`);
      }}
    >
      {children}
    </a>
  );
}
