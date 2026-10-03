"use client";

import { useEffect, useRef } from "react";

const HAM = ["H", "A", "M"];
const VOC = ["v", "ọ", "c"];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The wordmark, set across the full width. Letters near the pointer get
 * poked: the sans letters pinch thin and narrow, the italic ones thicken.
 */
export function FooterMark() {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const line = inner.current;
    if (!el || !line) return;
    const letters = [...line.querySelectorAll<HTMLSpanElement>("[data-l]")];
    const isHam = letters.map((l) => l.dataset.l === "ham");
    const cur = letters.map(() => 0);
    const written = letters.map(() => "");

    // size the mark to fill the width at rest
    const fit = () => {
      letters.forEach((l) => l.style.removeProperty("--wdth"));
      written.fill("");
      line.style.fontSize = "100px";
      const w = line.getBoundingClientRect().width;
      line.style.fontSize = `${(100 * el.clientWidth) / w}px`;
    };
    document.fonts.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const interactive =
      matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!interactive) return () => ro.disconnect();

    let px = -1e4, py = -1e4;
    let inView = false;
    let raf = 0;
    const kick = () => {
      if (inView && !raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      kick();
    };
    const loop = () => {
      const radius = el.clientWidth * 0.32;
      let moving = false;
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), (py - (r.top + r.height / 2)) * 0.8);
        const target = smoothstep(Math.max(0, 1 - d / radius));
        cur[i] += (target - cur[i]) * 0.12;
        if (Math.abs(target - cur[i]) > 0.001) moving = true;
        const t = cur[i];
        const style = isHam[i]
          ? `${(125 - 63 * t).toFixed(1)}|${(900 - 700 * t).toFixed(0)}`
          : `|${(300 + 500 * t).toFixed(0)}`;
        if (style === written[i]) return; // nothing changed: don't dirty the style
        written[i] = style;
        const [wdth, wght] = style.split("|");
        if (wdth) l.style.setProperty("--wdth", wdth);
        l.style.setProperty("--wght", wght);
      });
      // idle once every letter has settled; the next pointer move wakes it up
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      kick();
    });
    io.observe(el);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div ref={ref} className="footer-mark" aria-hidden>
      <span ref={inner}>
        {HAM.map((c, i) => (
          <span key={`h${i}`} className="fm-ham" data-l="ham">
            {c}
          </span>
        ))}
        {VOC.map((c, i) => (
          <span key={`v${i}`} className="fm-voc" data-l="voc">
            {c}
          </span>
        ))}
      </span>
    </div>
  );
}
