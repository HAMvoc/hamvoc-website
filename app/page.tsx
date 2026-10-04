import type { Metadata } from "next";
import Link from "next/link";
import { PaperItem } from "@/components/PaperItem";
import { site } from "@/content/site";
import { getAreas, getResearchStats } from "@/lib/papers";
import { getStats } from "@/lib/people";

export const metadata: Metadata = {
  title: { absolute: site.name },
  description: site.description,
};

export default function HomePage() {
  const people = getStats();
  const research = getResearchStats();
  const latest = getAreas()
    .flatMap((a) => a.papers)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const stats = [
    [people.people, "Members"],
    [people.cohorts.length, "Cohorts"],
    [research.papers, "Publications"],
  ] as const;

  return (
    <main>
      <section className="view-section">
        <div className="eyebrow">{site.name}</div>
        <h1 className="section-headline home-headline">Research born from relentless curiosity.</h1>
        <p className="section-lead">{site.description}</p>

        <dl className="home-stats">
          {stats.map(([n, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{n}</dd>
            </div>
          ))}
        </dl>

        <div className="gallery">
          <figure className="gallery-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/group.jpg" alt={`The members of ${site.name}`} width={1920} height={1440} fetchPriority="high" />
          </figure>
        </div>

        <div className="home-section-header">
          <h2 className="home-section-title">Latest publications</h2>
          <Link href="/research/" className="home-section-link">
            All publications →
          </Link>
        </div>
        <ul className="paper-list">
          {latest.map((paper) => (
            <PaperItem key={`${paper.area}/${paper.slug}`} paper={paper} />
          ))}
        </ul>
      </section>
    </main>
  );
}
