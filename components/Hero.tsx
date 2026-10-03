"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import type { PersonCard } from "@/lib/people";
import { groupLabel } from "@/lib/format";
import { navState } from "@/lib/nav";
import { FitName } from "./FitName";

const AUTOPLAY_MS = 4200;

/**
 * The lineup: everyone in the lab as a vertical slice of their portrait.
 * Slices are 1-bit dithered; the open one develops into a photograph and
 * their name is set across the caption.
 */
export function Hero({ people }: { people: PersonCard[] }) {
  const n = people.length;
  const start = Math.floor((n - 1) / 2);
  const [active, setActive] = useState(() => {
    const i = people.findIndex((p) => p.slug === navState.lastSlug);
    return i >= 0 ? i : start;
  });
  // during the intro the slices rise closed, then the first one opens
  const [held, setHeld] = useState(false);
  // photos are only requested once a slice has been (or is about to be) opened.
  // It is the same file the member page shows, so the morph lands on an image already decoded.
  const [seen, setSeen] = useState<Set<number>>(() => new Set([active, (active + 1) % n]));

  const hero = useRef<HTMLElement>(null);
  const lineup = useRef<HTMLDivElement>(null);
  const engaged = useRef(false);
  const lastInput = useRef(0);
  // read once: the boot script in <head> sets data-intro on the first visit of a session
  const intro = useRef<boolean | null>(null);

  // `at` is the event's timeStamp, on the same clock as performance.now()
  const open = (i: number, at: number) => {
    lastInput.current = at;
    setActive(i);
  };

  const upNext = (active + 1) % n;
  if (!seen.has(active) || !seen.has(upNext)) setSeen(new Set([...seen, active, upNext]));

  // Intro: once per session, slices rise from the centre out.
  useEffect(() => {
    const html = document.documentElement;
    intro.current ??= "intro" in html.dataset;
    if (!intro.current || !lineup.current || !hero.current) return;
    const slices = lineup.current.querySelectorAll(".slice");
    const top = hero.current.querySelector(".hero-top");
    setHeld(true);
    gsap.set(slices, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(top, { opacity: 0 });
    delete html.dataset.intro;
    try {
      sessionStorage.setItem("hv-intro", "1");
    } catch {}

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(slices, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.6,
      ease: "expo.out",
      stagger: { each: 0.05, from: "center" },
    })
      .call(() => setHeld(false), [], 0.75)
      .to(top, { opacity: 1, duration: 1.2, ease: "power2.out" }, 1)
      .set(slices, { clearProps: "clipPath" });
    return () => {
      tl.kill();
    };
  }, []);

  // Autoplay through the lineup while nobody is touching it.
  useEffect(() => {
    if (held || n < 2) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    if (hero.current) io.observe(hero.current);
    const id = setInterval(() => {
      if (engaged.current || !visible || document.hidden) return;
      if (performance.now() - lastInput.current < AUTOPLAY_MS) return;
      setActive((a) => (a + 1) % n);
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [held, n]);

  const p = people[active];

  return (
    <section ref={hero} className="hero" aria-label="Members of the lab">
      <div />
      <div className="hero-top label">
        <span>
          {n} people, one lab
        </span>
        <span className="hero-hint">Hover to meet them — click to read more</span>
      </div>

      <div
        ref={lineup}
        className="lineup"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") engaged.current = true;
        }}
        onPointerLeave={(e) => {
          engaged.current = false;
          lastInput.current = e.timeStamp;
        }}
      >
        {people.map((person, i) => {
          const isOpen = !held && i === active;
          return (
            <Link
              key={person.slug}
              href={`/people/${person.slug}/`}
              className="slice"
              data-active={isOpen || undefined}
              data-cursor="view"
              aria-label={`${person.name}, ${groupLabel(person)}`}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") open(i, e.timeStamp);
              }}
              onFocus={(e) => open(i, e.timeStamp)}
              onClick={(e) => {
                if (!isOpen) {
                  // first tap on touch screens opens the slice; the second follows the link
                  e.preventDefault();
                  open(i, e.timeStamp);
                  return;
                }
                navState.lastSlug = person.slug;
                navState.morphSlug = person.slug;
              }}
            >
              <ViewTransition name={`portrait-${person.slug}`} share="morph" default="none">
                <span className="slice-frame">
                  <span className="slice-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="slice-dither" src={person.images.dither} alt="" width={210} height={280} />
                    {seen.has(i) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="slice-photo"
                        src={person.images.lg}
                        alt=""
                        width={1200}
                        height={1600}
                        decoding="sync"
                      />
                    )}
                    <span className="slice-scan" />
                  </span>
                </span>
              </ViewTransition>
              <span className="slice-label label" aria-hidden>
                {person.callname}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="hero-caption" style={{ visibility: held ? "hidden" : undefined }}>
        {p && (
          <>
            <ViewTransition key={`name-${p.slug}-${held}`} name={`name-${p.slug}`} share="morph" default="none">
              <FitName as="p" text={p.callname} className="hero-name" animate />
            </ViewTransition>
            <div key={`meta-${p.slug}-${held}`} className="hero-meta label">
              <span className="hero-fullname meta-in" style={{ "--i": 0 } as CSSProperties}>
                {p.name}
              </span>
              <span className="meta-in" style={{ "--i": 1 } as CSSProperties}>
                {[groupLabel(p), p.major].filter(Boolean).join(" · ")}
              </span>
              {p.position && (
                <span className="meta-in" style={{ "--i": 2 } as CSSProperties}>
                  {p.position}
                </span>
              )}
              <span className="meta-in hero-count" style={{ "--i": 3 } as CSSProperties}>
                {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
