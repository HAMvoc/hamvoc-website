import Link from "next/link";
import type { CSSProperties } from "react";
import type { PersonCard } from "@/lib/people";

type Group = { label: string; people: PersonCard[] };

/**
 * Everyone as a portrait, one row per cohort with the advisor on top.
 * Portraits sit dithered and develop into the photograph on hover.
 */
export function Roster({ groups }: { groups: Group[] }) {
  return (
    <div className="cohorts">
      {groups.map((g) => (
        <section key={g.label} className="cohort" aria-label={g.label}>
          <div className="cohort-head">
            <h3 className="cohort-label">{g.label}</h3>
            <p className="cohort-count label">
              {g.people.length} {g.people.length === 1 ? "person" : "people"}
            </p>
          </div>
          <ul className="cohort-grid">
            {g.people.map((p, i) => (
              <li key={p.slug} style={{ "--i": i } as CSSProperties}>
                <Link href={`/people/${p.slug}/`} className="card">
                  <span className="card-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="card-dither" src={p.images.dither} alt="" width={210} height={280} loading="lazy" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="card-photo" src={p.images.sm} alt="" width={480} height={640} loading="lazy" />
                    <span className="slice-scan" />
                  </span>
                  <span className="card-name display">{p.callname}</span>
                  <span className="card-full">{p.name}</span>
                  <span className="card-meta label">
                    {[p.major, p.papers ? `${p.papers} ${p.papers === 1 ? "paper" : "papers"}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
