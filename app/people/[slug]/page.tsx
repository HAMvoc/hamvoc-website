import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { FitName } from "@/components/FitName";
import { PaperList } from "@/components/PaperList";
import { Portrait } from "@/components/Portrait";
import { getPapersBy } from "@/lib/papers";
import { getPeople, getPerson, groupLabel, toCard } from "@/lib/people";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPeople().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/people/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = getPerson(slug);
  if (!found) return {};
  const { person } = found;
  return {
    title: person.name,
    description: [groupLabel(person), person.major, person.research[0]].filter(Boolean).join(" · "),
    openGraph: { images: [person.images.lg] },
  };
}

const linkLabels = {
  email: "Email",
  github: "GitHub",
  scholar: "Google Scholar",
  linkedin: "LinkedIn",
  website: "Website",
} as const;

const slide = {
  "nav-forward": "slide-forward",
  "nav-back": "slide-back",
};

export default async function MemberPage({ params }: PageProps<"/people/[slug]">) {
  const { slug } = await params;
  const found = getPerson(slug);
  if (!found) notFound();
  const { person: p, index, total, prev, next } = found;
  const papers = getPapersBy(p.slug);
  const links = Object.entries(p.links).filter(([, v]) => v) as [keyof typeof linkLabels, string][];

  const facts = [
    [p.role === "advisor" ? "Role" : "Cohort", groupLabel(p)],
    ["Major", p.major],
    ["Currently", p.position],
    ["Topics", p.keywords.join(" / ")],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <ViewTransition
      enter={{ ...slide, default: "page-enter" }}
      exit={{ ...slide, default: "page-exit" }}
      default="none"
    >
      <main className="member" data-theme="dark">
        <div className="member-grid">
          <Portrait person={toCard(p)} />

          <article className="member-body">
            <div className="member-kicker label">
              <Link className="link-u" href="/" transitionTypes={["nav-back"]}>
                ← All people
              </Link>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <ViewTransition name={`name-${p.slug}`} share="morph" default="none">
              <FitName as="h1" text={p.callname} className="member-name" grow={1.25} />
            </ViewTransition>
            <p className="member-fullname" lang="vi">
              {p.name}
            </p>

            {facts.length > 0 && (
              <dl className="member-facts">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="label">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {p.research.length > 0 && (
              <section className="member-section" aria-labelledby="research-interests">
                <h2 id="research-interests" className="label">
                  Research interests
                </h2>
                <ul className="member-research">
                  {p.research.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            )}

            {papers.length > 0 && (
              <section className="member-section" aria-labelledby="papers">
                <h2 id="papers" className="label">
                  Papers <span className="member-count">{papers.length}</span>
                </h2>
                <PaperList papers={papers} compact />
              </section>
            )}

            {links.length > 0 && (
              <ul className="member-links label">
                {links.map(([k, v]) => (
                  <li key={k}>
                    <a
                      className="link-u"
                      href={k === "email" ? `mailto:${v}` : v}
                      {...(k === "email" ? {} : { target: "_blank", rel: "noreferrer" })}
                    >
                      {linkLabels[k] ?? k} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        {total > 1 && (
          <nav className="member-pager label" aria-label="More people">
            <Link href={`/people/${prev.slug}/`} transitionTypes={["nav-back"]}>
              <span>← Previous</span>
              <FitName text={prev.callname} className="pager-name" grow={1.5} />
            </Link>
            <Link href={`/people/${next.slug}/`} transitionTypes={["nav-forward"]}>
              <span>Next →</span>
              <FitName text={next.callname} className="pager-name" grow={1.5} />
            </Link>
          </nav>
        )}
      </main>
    </ViewTransition>
  );
}
