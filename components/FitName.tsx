"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Archivo's width axis range */
  min?: number;
  max?: number;
  /** how much a short name may grow in size once it is as wide as the face allows */
  grow?: number;
  /** extra tracking allowed when a short name still can't fill the line (em) */
  maxTrack?: number;
  /** words rise in once fitted */
  animate?: boolean;
  delay?: number;
};

type Fit = { wdth: number; size: number; track: number };
const fits = new Map<string, Fit>();

/**
 * Sets a name so it fills its container's width exactly, by moving along the
 * typeface's width axis instead of changing size. Short names get wide, long
 * names get narrow — everybody takes up the same line.
 */
export function FitName({
  text,
  as: Tag = "span",
  className = "",
  min = 62,
  max = 125,
  grow = 1,
  maxTrack = 0.05,
  animate = false,
  delay = 0,
}: Props) {
  const box = useRef<HTMLElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = box.current;
    const el = line.current;
    if (!wrap || !el) return;
    let frame = 0;

    const widthAt = (wdth: number) => {
      el.style.setProperty("--wdth", String(wdth));
      return el.getBoundingClientRect().width;
    };

    const fit = () => {
      if (document.fonts.status !== "loaded") return; // fonts.ready below will call again
      el.style.fontSize = "";
      el.style.letterSpacing = "";
      const target = wrap.clientWidth;
      if (!target) return;
      const base = parseFloat(getComputedStyle(el).fontSize);
      // the same name at the same size and width always fits the same way — measuring
      // forces layout, so do it once per combination (the hero swaps names every few seconds)
      const key = `${text}|${target}|${base}|${min}|${max}|${grow}|${maxTrack}`;
      const known = fits.get(key);
      if (known) {
        apply(known, base);
        return;
      }
      const wMin = widthAt(min);
      const wMax = widthAt(max);
      let wdth = max;
      let size = base;
      let track = 0;

      if (target <= wMin) {
        wdth = min;
        size = (base * target) / wMin;
      } else if (target >= wMax) {
        size = base * Math.min(grow, target / wMax);
        const chars = [...text].length;
        track = Math.min(maxTrack, (target - (wMax * size) / base) / chars / size);
      } else {
        // width is close to linear in wdth — a few secant steps land within a pixel
        let lo = min, wl = wMin, hi = max, wh = wMax;
        for (let k = 0; k < 4; k++) {
          const s = lo + ((hi - lo) * (target - wl)) / (wh - wl);
          const ws = widthAt(s);
          if (ws > target) { hi = s; wh = ws; } else { lo = s; wl = ws; }
          if (Math.abs(ws - target) < 0.5) break;
        }
        wdth = lo;
      }

      const result = { wdth, size, track };
      fits.set(key, result);
      apply(result, base);
    };

    const apply = ({ wdth, size, track }: Fit, base: number) => {
      el.style.setProperty("--wdth", wdth.toFixed(2));
      el.style.fontSize = size === base ? "" : `${size}px`;
      el.style.letterSpacing = track ? `${track}em` : "";
      wrap.dataset.fitted = "";
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    if (document.fonts.status === "loaded") fit();
    else document.fonts.ready.then(fit);
    const ro = new ResizeObserver(schedule);
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [text, min, max, grow, maxTrack]);

  const words = text.split(/\s+/);

  return (
    <Tag
      ref={box}
      className={`fit display ${className}`}
      data-animate={animate || undefined}
      style={delay ? ({ "--delay": `${delay}s` } as CSSProperties) : undefined}
    >
      <span ref={line} className="fit-line">
        {words.map((w, i) => (
          <span key={i}>
            {i > 0 && " "}
            <span className="fit-word" style={{ "--i": i } as CSSProperties}>
              {w}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
