import type { Metadata } from "next";
import { ViewTransition } from "react";
import { PaperList } from "@/components/PaperList";
import { Reveal } from "@/components/Reveal";
import { SectionLink } from "@/components/SectionLink";
import { getAreas, getResearchStats } from "@/lib/papers";

export const metadata: Metadata = {
  title: "Research",
  description: "Every paper from HAMvọc Lab, filed by research area.",
};

export default function ResearchPage() {
  const areas = getAreas();
  const stats = getResearchStats();
  const span = stats.from && stats.to ? (stats.from === stats.to ? `${stats.from}` : `${stats.from}–${stats.to}`) : "";

  return (
    <ViewTransition enter={{ default: "page-enter" }} exit={{ default: "page-exit" }} default="none">
      <main className="research">
        <header className="research-head">
          <Reveal as="h1" className="research-title">
            Research
          </Reveal>
          <p className="research-intro">
            Every paper from the lab, filed by area. Names underlined are lab members — follow them to their pages.
          </p>
          <p className="research-stats label">
            {stats.papers} papers · {stats.areas} areas{span && ` · ${span}`}
          </p>
          <nav className="research-index" aria-label="Research areas">
            {areas.map((a) => (
              <SectionLink key={a.slug} className="research-index-item" href={`/research/#${a.slug}`}>
                {a.title}
                <sup className="label">{a.papers.length}</sup>
              </SectionLink>
            ))}
          </nav>
        </header>

        {areas.length === 0 && (
          <p className="research-empty">
            No papers yet. Add one under <code>content/research/&lt;area&gt;/</code>.
          </p>
        )}

        {areas.map((a) => (
          <section key={a.slug} id={a.slug} className="area" aria-labelledby={`${a.slug}-title`}>
            <div className="area-aside">
              <h2 id={`${a.slug}-title`} className="area-title">
                {a.title}
              </h2>
              {a.description && <p className="area-desc">{a.description}</p>}
              <p className="area-count label">
                {a.papers.length} {a.papers.length === 1 ? "paper" : "papers"}
              </p>
            </div>
            <PaperList papers={a.papers} />
          </section>
        ))}
      </main>
    </ViewTransition>
  );
}
