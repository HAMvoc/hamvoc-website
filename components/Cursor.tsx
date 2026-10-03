"use client";

import { useEffect, useRef } from "react";

/**
 * The dot under the ọ in vọc, following the pointer. It inverts whatever it
 * passes over, and swells over links and portraits.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");
    let x = 0, y = 0, tx = 0, ty = 0;
    let raf = 0;
    let shown = false;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        x = tx;
        y = ty;
        shown = true;
        el.dataset.visible = "";
      }
      const t = (e.target as Element | null)?.closest?.("[data-cursor], a, button");
      el.dataset.state = t ? (t.getAttribute("data-cursor") ?? "link") : "";
    };
    const leave = () => {
      shown = false;
      delete el.dataset.visible;
    };
    const loop = () => {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      html.classList.remove("has-cursor");
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden />;
}
