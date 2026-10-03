"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The fixed header switches between ink and paper depending on the section
 * underneath it (sections mark themselves with data-theme="dark"), and slides
 * out of the way while scrolling down.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    let lastY = scrollY;
    const probe = () => {
      frame = 0;
      // tuck away while reading down the page, come back on the way up
      const y = scrollY;
      if (y > 160 && y > lastY + 4) header.dataset.hidden = "";
      else if (y < lastY - 4 || y <= 160) delete header.dataset.hidden;
      lastY = y;
      const under = document
        .elementsFromPoint(innerWidth / 2, header.offsetHeight / 2)
        .find((el) => !header.contains(el))
        ?.closest<HTMLElement>("[data-theme]");
      const dark = under?.dataset.theme === "dark";
      if (dark !== ("dark" in header.dataset)) {
        if (dark) header.dataset.dark = "";
        else delete header.dataset.dark;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };
    probe();
    // colour changes animate from here on, not on the first paint
    requestAnimationFrame(() => (header.dataset.ready = ""));
    // page swaps replace <main>, a direct child of <body>
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <header ref={ref} className="site-header label">
      {children}
    </header>
  );
}
