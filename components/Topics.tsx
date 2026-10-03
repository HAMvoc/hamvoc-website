import Link from "next/link";
import { Fragment } from "react";
import type { Person } from "@/lib/people";
import { Reveal } from "./Reveal";

type Topic = { topic: string; people: Person[] };

/** Every research topic people listed, most shared first, footnoted with who works on it. */
export function Topics({ topics }: { topics: Topic[] }) {
  return (
    <section id="research" className="topics" aria-labelledby="research-title">
      <div className="section-head">
        <Reveal as="h2" id="research-title" className="section-title">
          Research
        </Reveal>
        <p className="section-aside label">
          {topics.length} topics, as listed by the people working on them
        </p>
      </div>
      <p className="topics-list">
        {topics.map((t) => (
          <Fragment key={t.topic}>
            <span className="topic">
              {t.topic}
              <span className="topic-people">
                {t.people.map((p, j) => (
                  <Fragment key={p.slug}>
                    {j > 0 && ", "}
                    <Link href={`/people/${p.slug}/`}>{p.callname}</Link>
                  </Fragment>
                ))}
              </span>
            </span>{" "}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
