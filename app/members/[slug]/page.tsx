import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperItem } from "@/components/PaperItem";
import { Portrait } from "@/components/Portrait";
import { getPapersBy } from "@/lib/papers";
import { getPeople, getPerson, groupLabel } from "@/lib/people";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPeople().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/members/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = getPerson(slug);
  if (!found) return {};
  const { person } = found;
  return {
    title: person.name,
    description: [groupLabel(person), person.major, person.position?.replace(/\r?\n+/g, " · ")].filter(Boolean).join(" · "),
  };
}

const PENDING = "To be updated";

const linkLabels: Record<string, string> = {
  email: "Email",
  github: "GitHub",
  scholar: "Google Scholar",
  orcid: "ORCID",
  researchgate: "ResearchGate",
  linkedin: "LinkedIn",
  website: "Website",
};

export default async function MemberPage({ params }: PageProps<"/members/[slug]">) {
  const { slug } = await params;
  const found = getPerson(slug);
  if (!found) notFound();
  const { person: p, prev, next } = found;
  const papers = getPapersBy(p.slug);
  const links = Object.entries(p.links).filter(([, v]) => v);

  // the profile fields every member page shows, filled in or not
  const facts = [
    [p.role === "advisor" ? "Role" : "Cohort", groupLabel(p)],
    ["Major", p.major],
    ...(p.noPosition ? [] : [["Current position", p.position]]),
  ] as [string, string][];

  return (
    <main>
      <section className="view-section">
        <Link href="/members/" className="back-link">
          ← All members
        </Link>

        <div className="profile">
          <Portrait person={p} priority />

          <div className="profile-body">
            <div className="eyebrow">{groupLabel(p) || "Member"}</div>
            <h1 className="section-headline profile-name">{p.name}</h1>

            <dl className="profile-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd className={v ? undefined : "pending"}>{v || PENDING}</dd>
                </div>
              ))}
            </dl>

            <h2 className="profile-heading">Research interests</h2>
            {p.research.length > 0 ? (
              <ul className="profile-research">
                {p.research.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="pending">{PENDING}</p>
            )}

            {links.length > 0 && (
              <div className="profile-links">
                {links.map(([k, v]) => (
                  <a
                    key={k}
                    href={k === "email" ? `mailto:${v}` : v}
                    {...(k === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {linkLabels[k] ?? k} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {papers.length > 0 && (
          <div className="profile-papers">
            <div className="cohort-header">
              <h2 className="cohort-title">Publications</h2>
              <span className="cohort-count">{papers.length}</span>
            </div>
            <ul className="paper-list">
              {papers.map((paper) => (
                <PaperItem key={`${paper.area}/${paper.slug}`} paper={paper} />
              ))}
            </ul>
          </div>
        )}

        <nav className="profile-pager" aria-label="More members">
          <Link href={`/members/${prev.slug}/`}>← {prev.name}</Link>
          <Link href={`/members/${next.slug}/`}>{next.name} →</Link>
        </nav>
      </section>
    </main>
  );
}
