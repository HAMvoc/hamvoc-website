"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ViewTransition,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import type { PersonCard } from "@/lib/people";
import { groupLabel } from "@/lib/format";
import { navState } from "@/lib/nav";
import { FitName } from "./FitName";

const AUTOPLAY_MS = 4200;

type Geo = { width: number; gap: number; open: number };
type Box = { x: number; w: number };

/** Where each slice sits for a given open slice (-1: all equal). */
function arrange(n: number, geo: Geo, open: number): Box[] {
  const free = geo.width - geo.gap * (n - 1);
  const rest = open < 0 || n < 2 ? free / n : (free - geo.open) / (n - 1);
  let x = 0;
  return Array.from({ length: n }, (_, i) => {
    const w = i === open ? geo.open : rest;
    const box = { x, w };
    x += w + geo.gap;
    return box;
  });
}

/**
 * The lineup: everyone in the lab as a vertical slice of their portrait.
 * Slices are 1-bit dithered; the open one develops into a photograph and
 * their name is set across the caption.
 *
 * Every slice is as wide as an open portrait and is only moved (transform)
 * and cropped (clip-path), so opening one never triggers layout.
 */
export function Hero({ people }: { people: PersonCard[] }) {
  const n = people.length;
  const start = Math.floor((n - 1) / 2);
  const router = useRouter();
  const [active, setActive] = useState(() => {
    const i = people.findIndex((p) => p.slug === navState.lastSlug);
    return i >= 0 ? i : start;
  });
  // during the intro the slices rise closed, then the first one opens
  const [held, setHeld] = useState(false);
  // photos are only requested once a slice has been (or is about to be) opened
  const [seen, setSeen] = useState<Set<number>>(() => new Set([active, (active + 1) % n]));

  const hero = useRef<HTMLElement>(null);
  const lineup = useRef<HTMLDivElement>(null);
  const slices = useRef<(HTMLAnchorElement | null)[]>([]);
  const geo = useRef<Geo | null>(null);
  const boxes = useRef<Box[]>([]);
  const instant = useRef(true);
  const engaged = useRef(false);
  const lastInput = useRef(0);
  // read once: the boot script in <head> sets data-intro on the first visit of a session
  const intro = useRef<boolean | null>(null);

  const upNext = (active + 1) % n;
  if (!seen.has(active) || !seen.has(upNext)) setSeen(new Set([...seen, active, upNext]));

  // `at` is the event's timeStamp, on the same clock as performance.now()
  const open = (i: number, at: number) => {
    lastInput.current = at;
    setActive(i);
  };

  const place = useEffectEvent(() => {
    const el = lineup.current;
    const g = geo.current;
    if (!el || !g) return;
    if (instant.current) el.dataset.instant = "";
    boxes.current = arrange(n, g, held ? -1 : active);
    boxes.current.forEach(({ x, w }, i) => {
      const s = slices.current[i];
      if (!s) return;
      const inset = (g.open - w) / 2;
      s.style.transform = `translate3d(${x - inset}px,0,0)`;
      s.style.clipPath = `inset(0 ${inset}px)`;
    });
    el.dataset.ready = "";
    if (instant.current) {
      instant.current = false;
      requestAnimationFrame(() => requestAnimationFrame(() => delete el.dataset.instant));
    }
  });

  // measure once, then again only when the lineup itself resizes
  useLayoutEffect(() => {
    const el = lineup.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      const g = {
        width,
        gap: width < 600 ? 2 : 3,
        open: Math.min(height * 0.75, width * (n > 1 ? 0.62 : 1)),
      };
      geo.current = g;
      el.style.setProperty("--open", `${g.open}px`);
      instant.current = true;
      place();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  useLayoutEffect(() => {
    place();
  }, [active, held]);

  // warm the next photo so autoplay never reveals an undecoded image
  useEffect(() => {
    const img = new Image();
    img.src = people[upNext].images.lg;
    img.decode().catch(() => {});
  }, [people, upNext]);

  // Intro: once per session, slices rise from the centre out.
  useEffect(() => {
    const html = document.documentElement;
    intro.current ??= "intro" in html.dataset;
    if (!intro.current || !lineup.current || !hero.current) return;
    const frames = lineup.current.querySelectorAll(".slice-frame");
    const top = hero.current.querySelector(".hero-top");
    instant.current = true;
    setHeld(true);
    gsap.set(frames, { yPercent: 100 });
    gsap.set(top, { opacity: 0 });
    delete html.dataset.intro;
    try {
      sessionStorage.setItem("hv-intro", "1");
    } catch {}

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(frames, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: { each: 0.05, from: "center" } })
      .call(() => setHeld(false), [], 0.8)
      .to(top, { opacity: 1, duration: 1.2, ease: "power2.out" }, 1)
      .set(frames, { clearProps: "transform" });
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
    <section ref={hero} className="hero" data-theme="dark" aria-label="Members of the lab">
      <div />
      <div className="hero-top label">
        <span>{n} people, one lab</span>
        <span className="hero-hint">Hover to meet them — click to read more</span>
      </div>

      <div
        ref={lineup}
        className="lineup"
        data-cursor="view"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") engaged.current = true;
        }}
        onPointerLeave={(e) => {
          engaged.current = false;
          lastInput.current = e.timeStamp;
        }}
        onPointerMove={(e) => {
          // Pick the slice from where the pointer is in the *target* layout, not from what
          // is under it mid-animation — otherwise slices sliding under a still pointer
          // keep re-triggering each other.
          if (e.pointerType !== "mouse" || held || !lineup.current) return;
          const x = e.clientX - lineup.current.getBoundingClientRect().left;
          const gap = geo.current?.gap ?? 0;
          const i = boxes.current.findIndex((b) => x < b.x + b.w + gap / 2);
          const next = i < 0 ? n - 1 : i;
          if (next !== active) open(next, e.timeStamp);
        }}
      >
        {people.map((person, i) => {
          const isOpen = !held && i === active;
          return (
            <Link
              key={person.slug}
              ref={(el) => {
                slices.current[i] = el;
              }}
              href={`/people/${person.slug}/`}
              className="slice"
              data-active={isOpen || undefined}
              data-cursor="view"
              aria-label={`${person.name}, ${groupLabel(person)}`}
              onFocus={(e) => open(i, e.timeStamp)}
              onClick={(e) => {
                const target = people[active];
                if (!isOpen) {
                  e.preventDefault();
                  // A mouse is already pointing at the open slice (the DOM may still be
                  // mid-animation), so go there; a tap on a closed slice opens it first.
                  if (held || (e.nativeEvent as PointerEvent).pointerType !== "mouse") {
                    open(i, e.timeStamp);
                    return;
                  }
                  navState.lastSlug = navState.morphSlug = target.slug;
                  router.push(`/people/${target.slug}/`);
                  return;
                }
                navState.lastSlug = navState.morphSlug = person.slug;
              }}
            >
              <ViewTransition name={`portrait-${person.slug}`} share="morph" default="none">
                <span className="slice-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="slice-dither" src={person.images.dither} alt="" width={210} height={280} />
                  {seen.has(i) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="slice-photo"
                      src={person.images.lg}
                      alt=""
                      width={960}
                      height={1280}
                      decoding="async"
                    />
                  )}
                  <span className="slice-scan" />
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
