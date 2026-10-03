import Link from "next/link";
import type { Area } from "@/lib/papers";
import { Reveal } from "./Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

/** The landing page's way into /research: one row per research area. */
export function ResearchTeaser({
  areas,
  stats,
}: {
  areas: Area[];
  stats: { papers: number; from: number | null; to: number | null };
}) {
  const span = stats.from && stats.to ? (stats.from === stats.to ? ` · ${stats.from}` : ` · ${stats.from}–${stats.to}`) : "";
  return (
    <section id="research" className="teaser" aria-labelledby="research-title">
      <div className="section-head">
        <Reveal as="h2" id="research-title" className="section-title">
          Research
        </Reveal>
        <p className="section-aside label">
          {stats.papers} papers · {areas.length} areas{span}
        </p>
      </div>
      <ul className="teaser-list">
        {areas.map((a) => (
          <li key={a.slug}>
            <Link href={`/research/#${a.slug}`} className="teaser-row row-invert">
              <span className="teaser-title">{a.title}</span>
              <span className="teaser-count label">
                {pad(a.papers.length)} {a.papers.length === 1 ? "paper" : "papers"}
              </span>
              <span className="teaser-latest">
                {a.papers[0] && (
                  <>
                    <span className="label">Latest — </span>
                    {a.papers[0].title}
                  </>
                )}
              </span>
              <span className="teaser-arrow label" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="teaser-all label">
        <Link className="link-u" href="/research/">
          All {stats.papers} papers →
        </Link>
      </p>
    </section>
  );
}
