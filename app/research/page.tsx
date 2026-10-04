import type { Metadata } from "next";
import { getResearchPublications } from "@/lib/papers";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Peer-reviewed research publications from HAMvọc Lab, organized by venue.",
};

export default function ResearchPage() {
  const { journals, conferences } = getResearchPublications();

  const categories = [journals, conferences];

  return (
    <main>
      <section id="research" className="view-section">
        <div className="eyebrow">[PUBLICATIONS // PEER-REVIEWED]</div>
        <h1 className="section-headline">Research Publications</h1>
        <p className="section-lead">
          Our peer-reviewed research papers are categorized into Journal Articles
          and Conference Papers, organized directly by publication venue.
        </p>

        {categories.map((cat) => (
          <div key={cat.id} className="research-group">
            <div className="research-group-header">
              <div className="research-group-title">
                <span>{cat.title}</span>
                <span className="meta-tag">{cat.tag}</span>
              </div>
            </div>

            {cat.venues.map((venueGroup) => (
              <div key={venueGroup.venue} className="venue-block">
                <div className="venue-header">
                  <div className="venue-name">
                    <span className="venue-marker" aria-hidden="true" />
                    <span>{venueGroup.venue}</span>
                  </div>
                  <span className="meta-tag">{venueGroup.tag}</span>
                </div>

                <ul className="venue-papers-list">
                  {venueGroup.papers.map((paper) => (
                    <li key={paper.slug} className="paper-item">
                      {paper.award && (
                        <span className="paper-award">{paper.award}</span>
                      )}
                      <div className="paper-title">{paper.title}</div>
                      <div className="paper-authors">
                        {paper.authors.map((author, idx) => (
                          <span key={author.name}>
                            {idx > 0 && ", "}
                            {author.slug ? (
                              <strong>{author.name}</strong>
                            ) : (
                              author.name
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="paper-meta-row">
                        {paper.year && (
                          <span className="paper-year">{paper.year}</span>
                        )}
                        {paper.links.map((link) => {
                          const isDoi = link.label.toLowerCase() === "doi";
                          const cleanDoi = link.href.replace(
                            /^https?:\/\/(dx\.)?doi\.org\//i,
                            "",
                          );
                          const isArxiv = link.label.toLowerCase() === "arxiv";
                          const cleanArxiv = link.href.replace(
                            /^https?:\/\/arxiv\.org\/abs\//i,
                            "",
                          );

                          let displayText = link.label;
                          if (isDoi) displayText = `DOI: ${cleanDoi}`;
                          else if (isArxiv) displayText = `arXiv: ${cleanArxiv}`;
                          else displayText = `${link.label} ↗`;

                          return (
                            <a
                              key={link.href}
                              href={link.href}
                              className="paper-doi-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {displayText}
                            </a>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
