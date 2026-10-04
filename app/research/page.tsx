import type { Metadata } from "next";
import { PaperItem } from "@/components/PaperItem";
import { getAreas, getResearchStats } from "@/lib/papers";

export const metadata: Metadata = {
  title: "Research",
  description: "Journal articles, conference papers and book chapters from HAMvọc Lab.",
};

export default function ResearchPage() {
  // one folder each: content/research/journal, conference, book-chapter
  const groups = getAreas().filter((g) => g.papers.length > 0);
  const stats = getResearchStats();
  const span = stats.from && stats.to ? (stats.from === stats.to ? `${stats.from}` : `${stats.from}–${stats.to}`) : "";

  return (
    <main>
      <section className="view-section">
        <div className="eyebrow">Research</div>
        <h1 className="section-headline">Publications</h1>
        <p className="section-lead">
          {stats.papers} publications{span && ` · ${span}`}
        </p>

        {groups.map((g) => (
          <div key={g.slug} id={g.slug} className="research-group">
            <div className="cohort-header">
              <h2 className="cohort-title">{g.title}</h2>
              <span className="cohort-count">{g.papers.length}</span>
            </div>
            <ul className="paper-list">
              {g.papers.map((paper) => (
                <PaperItem key={paper.slug} paper={paper} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
