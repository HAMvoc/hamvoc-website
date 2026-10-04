import { site } from "@/content/site";
import { BigWordmark } from "./BigWordmark";
import { SectionLink } from "./SectionLink";

/**
 * The lab's name set across the full width, over one photograph of everyone.
 * The photo arrives dithered and develops, top to bottom, behind a red scan line.
 */
export function Hero({ facts }: { facts: string[] }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {site.name}
      </h1>
      <BigWordmark className="hero-mark" />
      <figure className="hero-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-dither" src="/group-dither.png" alt="" width={480} height={270} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-image"
          src="/group.jpg"
          alt={`The members of ${site.name}`}
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <span className="slice-scan" />
      </figure>
      <div className="hero-caption label">
        <span>Student research lab · {site.place}</span>
        <span>{facts.join(" · ")}</span>
        <SectionLink className="link-u" href="#people">
          Meet the people ↓
        </SectionLink>
      </div>
    </section>
  );
}
