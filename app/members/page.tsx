import type { Metadata } from "next";
import Link from "next/link";
import { Portrait } from "@/components/Portrait";
import { getPapersBy } from "@/lib/papers";
import { getGroupedMembers } from "@/lib/people";

export const metadata: Metadata = {
  title: "Members",
  description: "The advisor and student researchers of HAMvọc Lab.",
};

export default function MembersPage() {
  const groups = getGroupedMembers();

  return (
    <main>
      <section className="view-section">
        <div className="eyebrow">Members</div>
        <h1 className="section-headline">The people of HAMvọc</h1>
        <p className="section-lead">Our advisor and students, by cohort.</p>

        {groups.map((group) => (
          <div key={group.title} className="cohort-block">
            <div className="cohort-header">
              <h2 className="cohort-title">{group.title}</h2>
            </div>

            <div className={group.isAdvisor ? "advisor-grid" : "members-grid"}>
              {group.members.map((p) => {
                const papers = getPapersBy(p.slug).length;
                return (
                  <Link key={p.slug} href={`/members/${p.slug}/`} className="member-card">
                    <Portrait person={p} />
                    <div className="member-info">
                      <h3 className="member-name">{p.name}</h3>
                      <div className="member-role">
                        {group.isAdvisor ? p.position : p.major || "Research member"}
                      </div>
                      {papers > 0 && (
                        <div className="member-major">
                          {papers} {papers === 1 ? "publication" : "publications"}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
