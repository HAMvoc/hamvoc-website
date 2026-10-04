import type { Metadata } from "next";
import { ViewTransition } from "react";
import { PaperList } from "@/components/PaperList";
import { Reveal } from "@/components/Reveal";
import { getAreas, getResearchStats } from "@/lib/papers";

export const metadata: Metadata = {
  title: "Research",
  description: "Journal articles and conference papers from HAMvọc Lab.",
};

export default function ResearchPage() {
  // one folder each: content/research/journal and content/research/conference
  const groups = getAreas();
  const stats = getResearchStats();
  const span = stats.from && stats.to ? (stats.from === stats.to ? `${stats.from}` : `${stats.from}–${stats.to}`) : "";

  return (
    <ViewTransition enter={{ default: "page-enter" }} exit={{ default: "page-exit" }} default="none">
      <main className="research">
        <header className="research-head">
          <Reveal as="h1" className="research-title">
            Research
          </Reveal>
          <p className="research-stats label">
            {[...groups.map((g) => `${g.papers.length} ${g.title.toLowerCase()}`), span].filter(Boolean).join(" · ")}
          </p>
        </header>

        {groups.length === 0 && (
          <p className="research-empty">
            No papers yet. Add one under <code>content/research/journal/</code> or{" "}
            <code>content/research/conference/</code>.
          </p>
        )}

        {groups.map((g) => (
          <section key={g.slug} id={g.slug} className="area" aria-labelledby={`${g.slug}-title`}>
            <h2 id={`${g.slug}-title`} className="area-title">
              {g.title}
              <sup className="area-count label">{String(g.papers.length).padStart(2, "0")}</sup>
            </h2>
            <PaperList papers={g.papers} />
          </section>
        ))}
      </main>
    </ViewTransition>
  );
}
