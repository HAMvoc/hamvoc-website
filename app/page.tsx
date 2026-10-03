import { ViewTransition } from "react";
import { Definition } from "@/components/Definition";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Roster } from "@/components/Roster";
import { Topics } from "@/components/Topics";
import { getPeople, getStats, getTopics, groupLabel, toCard } from "@/lib/people";

export default function Home() {
  const people = getPeople();
  const stats = getStats();
  const cards = people.map(toCard);

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
        <section id="people" className="roster" aria-labelledby="people-title">
          <div className="section-head">
            <Reveal as="h2" id="people-title" className="section-title">
              People
            </Reveal>
            <p className="section-aside label">
              {stats.people} people · {stats.cohorts.length} cohorts · {stats.majors} majors
            </p>
          </div>
          <Roster groups={groups} />
        </section>
        <Topics topics={getTopics()} />
      </main>
    </ViewTransition>
  );
}
