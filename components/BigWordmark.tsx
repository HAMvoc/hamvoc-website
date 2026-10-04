"use client";

import { useEffect, useRef } from "react";

/** The HAMvọc wordmark, sized to fill the full width of its container. */
export function BigWordmark({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const line = inner.current;
    if (!el || !line) return;
    const fit = () => {
      line.style.fontSize = "100px";
      const w = line.getBoundingClientRect().width;
      line.style.fontSize = `${(100 * el.clientWidth) / w}px`;
      el.dataset.fitted = "";
    };
    document.fonts.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`big-mark ${className}`} aria-hidden>
      <span ref={inner}>
        <span className="bm-ham">HAM</span>
        <span className="bm-voc">vọc</span>
      </span>
    </div>
  );
}
