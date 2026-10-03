"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PersonCard } from "@/lib/people";
import { FitName } from "./FitName";

type Group = { label: string; people: PersonCard[] };

/**
 * Everyone, grouped by cohort. Given names are fitted to the same width so the
 * column reads as one justified block; hovering a row floats their portrait
 * next to the pointer.
 */
export function Roster({ groups }: { groups: Group[] }) {
  const preview = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<PersonCard | null>(null);
  const [shown, setShown] = useState<PersonCard | null>(null);

  // Pointer-follow with a little lag. Runs only while a row is hovered.
  useEffect(() => {
    const el = preview.current;
    if (!hovered || !el || !matchMedia("(pointer: fine)").matches) return;
    const pos = { x: lastPointer.x, y: lastPointer.y };
    let raf = 0;
    const loop = () => {
      pos.x += (lastPointer.x - pos.x) * 0.18;
      pos.y += (lastPointer.y - pos.y) * 0.18;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = pos.x + 32 + w > innerWidth ? pos.x - 32 - w : pos.x + 32;
      const y = Math.min(Math.max(pos.y - h / 2, 12), innerHeight - h - 12);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  return (
    <div className="roster-list">
      {groups.map((g) => (
        <div key={g.label} className="roster-group">
          <h3 className="roster-group-label label">{g.label}</h3>
          <div className="roster-rows">
            {g.people.map((p) => (
              <Link
                key={p.slug}
                href={`/people/${p.slug}/`}
                className="roster-row"
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  setHovered(p);
                  setShown(p);
                }}
                onPointerLeave={() => setHovered(null)}
              >
                <FitName text={p.callname} className="roster-name" grow={1.9} />
                <span className="roster-full">{p.name}</span>
                <span className="roster-meta label">
                  <span>{p.major}</span>
                  {p.position && <span>{p.position}</span>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div ref={preview} className="roster-preview" data-on={hovered ? "" : undefined} aria-hidden>
        {shown && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="preview-dither" src={shown.images.dither} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={shown.slug} className="preview-photo" src={shown.images.sm} alt="" />
          </>
        )}
      </div>
    </div>
  );
}

// shared pointer position, so a newly shown preview starts where the pointer is
const lastPointer = { x: -999, y: -999 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
    },
    { passive: true },
  );
}
