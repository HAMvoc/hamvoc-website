import { ViewTransition } from "react";
import { Definition } from "@/components/Definition";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Roster } from "@/components/Roster";
import { ResearchTeaser } from "@/components/ResearchTeaser";
import { getAreas, getPapersBy, getResearchStats } from "@/lib/papers";
import { getPeople, getStats, groupLabel, toCard } from "@/lib/people";

export default function Home() {
  const people = getPeople();
  const stats = getStats();
  const cards = people.map((p) => toCard(p, getPapersBy(p.slug).length));
  const summary = [
    `${stats.people} people`,
    stats.cohorts.length > 0 && `${stats.cohorts.length} cohorts`,
    `${getResearchStats().papers} papers`,
  ].filter(Boolean);

  const groups: { label: string; people: typeof cards }[] = [];
  for (const p of cards) {
    const label = groupLabel(p) || "Members";
    const g = groups.at(-1);
    if (g?.label === label) g.people.push(p);
    else groups.push({ label, people: [p] });
  }

  return (
    <ViewTransition
      enter={{ default: "page-enter" }}
      exit={{ default: "page-exit" }}
      default="none"
    >
      <main>
        <Hero people={cards} />
        <Definition count={stats.people} from={stats.cohorts[0]} to={stats.cohorts.at(-1)} />
        <section id="people" className="roster" data-theme="dark" aria-labelledby="people-title">
          <div className="section-head">
            <Reveal as="h2" id="people-title" className="section-title">
              People
            </Reveal>
            <p className="section-aside label">
              {summary.join(" · ")}
            </p>
          </div>
          <Roster groups={groups} />
        </section>
        <ResearchTeaser areas={getAreas()} stats={getResearchStats()} />
      </main>
    </ViewTransition>
  );
}
