import Link from "next/link";
import { Fragment } from "react";
import type { Paper } from "@/lib/papers";

/** One publication: title, authors (lab members linked), venue and links. */
export function PaperItem({ paper }: { paper: Paper }) {
  const main = paper.links[0];
  const meta = [paper.venue, paper.publisher, paper.year].filter(Boolean).join(" · ");

  return (
    <li className="paper-item">
      <h3 className="paper-title">
        {main ? (
          <a href={main.href} target="_blank" rel="noopener noreferrer">
            {paper.title}
          </a>
        ) : (
          paper.title
        )}
      </h3>
      <p className="paper-authors">
        {paper.authors.map((a, i) => (
          <Fragment key={`${a.name}-${i}`}>
            {i > 0 && ", "}
            {a.slug ? (
              <Link href={`/members/${a.slug}/`} className="paper-member">
                {a.name}
              </Link>
            ) : (
              a.name
            )}
          </Fragment>
        ))}
      </p>
      <div className="paper-meta-row">
        <span className="paper-venue">{meta}</span>
        {paper.award && <span className="paper-award">{paper.award}</span>}
        {paper.links.map((l) => (
          <a key={l.href} href={l.href} className="paper-link" target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
        {paper.isbn && <span className="paper-venue">ISBN {paper.isbn}</span>}
      </div>
    </li>
  );
}
