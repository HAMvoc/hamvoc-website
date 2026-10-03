import Link from "next/link";
import { Fragment } from "react";
import type { Paper } from "@/lib/papers";

const external = { target: "_blank", rel: "noreferrer" } as const;

/** Papers as rows: year · title and authors · venue and links. Lab members link to their pages. */
export function PaperList({ papers, compact = false }: { papers: Paper[]; compact?: boolean }) {
  return (
    <ol className={`papers${compact ? " papers--compact" : ""}`}>
      {papers.map((p) => {
        const main = p.links[0];
        return (
          <li key={`${p.area}/${p.slug}`} className="paper">
            <span className="paper-year label">{p.year ?? "—"}</span>
            <div className="paper-body">
              <h3 className="paper-title">
                {main ? (
                  <a className="link-u" href={main.href} {...external}>
                    {p.title}
                  </a>
                ) : (
                  p.title
                )}
              </h3>
              {p.authors.length > 0 && (
                <p className="paper-authors">
                  {p.authors.map((a, i) => (
                    <Fragment key={`${a.name}-${i}`}>
                      {i > 0 && ", "}
                      {a.slug ? (
                        <Link className="paper-member" href={`/people/${a.slug}/`}>
                          {a.name}
                        </Link>
                      ) : (
                        a.name
                      )}
                    </Fragment>
                  ))}
                </p>
              )}
            </div>
            <div className="paper-side label">
              {p.venue && <span>{p.venue}</span>}
              {p.links.length > 0 && (
                <span className="paper-links">
                  {p.links.map((l) => (
                    <a key={l.label} className="link-u" href={l.href} {...external}>
                      {l.label} ↗
                    </a>
                  ))}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
