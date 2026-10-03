"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Words go from faint to full ink as the passage scrolls through the viewport. */
export function ScrubText({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".scrub-w",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 82%", end: "bottom 52%", scrub: 0.6 },
        },
      );
    },
    { scope: ref },
  );

  const words = children.split(" ");
  return (
    <span ref={ref}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="scrub-w">{w}</span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}
