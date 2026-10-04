"use client";

import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import type { PersonCard } from "@/lib/people";
import { navState } from "@/lib/nav";

type Group = { label: string; people: PersonCard[] };

/**
 * Everyone as a portrait, one row per cohort with the advisor on top.
 * Portraits sit dithered and develop into the photograph on hover; clicking one
 * carries the portrait over to that person's page.
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
                <Link
                  href={`/people/${p.slug}/`}
                  className="card"
                  onClick={() => {
                    navState.lastSlug = navState.morphSlug = p.slug;
                  }}
                >
                  <ViewTransition name={`portrait-${p.slug}`} share="morph" default="none">
                    <span className="card-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="card-dither" src={p.images.dither} alt="" width={210} height={280} loading="lazy" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="card-photo" src={p.images.lg} alt="" width={960} height={1280} loading="lazy" />
                      <span className="slice-scan" />
                    </span>
                  </ViewTransition>
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
