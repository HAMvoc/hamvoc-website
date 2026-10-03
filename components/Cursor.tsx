"use client";

import { useEffect, useRef } from "react";

/**
 * The dot under the ọ in vọc, sitting exactly on the pointer. It inverts
 * whatever it passes over and swells a little over links and portraits.
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
    let x = 0;
    let y = 0;
    let frame = 0;
    let state = "";

    const draw = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(draw);
      if (!("visible" in el.dataset)) el.dataset.visible = "";
      const t = (e.target as Element | null)?.closest?.("[data-cursor], a, button");
      const next = t ? (t.getAttribute("data-cursor") ?? "link") : "";
      if (next !== state) {
        state = next;
        el.dataset.state = next;
      }
    };
    const leave = () => delete el.dataset.visible;

    window.addEventListener("pointermove", move, { passive: true });
    html.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      html.removeEventListener("pointerleave", leave);
      html.classList.remove("has-cursor");
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden />;
}
