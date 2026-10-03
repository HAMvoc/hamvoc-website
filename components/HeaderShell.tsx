"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The fixed header slides out of the way while scrolling down and comes back on the way up. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    let lastY = scrollY;
    const update = () => {
      frame = 0;
      // tuck away while reading down the page, come back on the way up
      const y = scrollY;
      if (y > 160 && y > lastY + 4) header.dataset.hidden = "";
      else if (y < lastY - 4 || y <= 160) delete header.dataset.hidden;
      lastY = y;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // slide animations start after the first paint
    requestAnimationFrame(() => (header.dataset.ready = ""));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
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
