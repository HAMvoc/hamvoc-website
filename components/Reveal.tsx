"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** Text rises out of its own baseline the first time it scrolls into view. */
export function Reveal({
  as: Tag = "div",
  className,
  id,
  children,
}: {
  as?: ElementType;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} className={className} data-reveal>
      <span>{children}</span>
    </Tag>
  );
}
