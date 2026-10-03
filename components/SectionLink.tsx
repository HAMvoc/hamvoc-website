"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { smooth } from "@/lib/lenis";

/** Link to a section of the home page; scrolls smoothly when already there. */
export function SectionLink({
  hash,
  className,
  children,
}: {
  hash: `#${string}`;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname !== "/" && hash !== "#top") {
    return (
      <Link href={`/${hash}`} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={hash}
      className={className}
      onClick={(e) => {
        const target = hash === "#top" ? 0 : document.querySelector<HTMLElement>(hash);
        if (target === null) return;
        e.preventDefault();
        if (smooth.lenis) smooth.lenis.scrollTo(target, { duration: 1.6 });
        else if (target === 0) window.scrollTo({ top: 0 });
        else target.scrollIntoView();
        if (hash !== "#top") history.replaceState(history.state, "", hash);
      }}
    >
      {children}
    </a>
  );
}
