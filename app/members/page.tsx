import type { Metadata } from "next";
import Image from "next/image";
import { getGroupedMembers } from "@/lib/people";

export const metadata: Metadata = {
  title: "Members",
  description: "Faculty advisor and student research members at HAMvọc Lab.",
};

export default function MembersPage() {
  const groups = getGroupedMembers();

  return (
    <main>
      <section id="members" className="view-section">
        <div className="eyebrow">[ROSTER // RESEARCH LAB]</div>
        <h1 className="section-headline">Lab Members</h1>
        <p className="section-lead">
          Faculty advisors and student researchers at HAMvọc Lab, organized by role
          and cohort.
        </p>

        {groups.map((group) => {
          if (group.isAdvisor) {
            return (
              <div key={group.title} className="cohort-block">
                <div className="cohort-header">
                  <div className="cohort-title">
                    <span>{group.title}</span>
                    <span className="cohort-badge">{group.badge}</span>
                  </div>
                  <span className="cohort-count">{group.countLabel}</span>
                </div>

                <div className="advisor-grid">
                  {group.members.map((p) => (
                    <div key={p.slug} style={{ display: "contents" }}>
                      <div className="portrait-box">
                        {p.hasRealPhoto ? (
                          <Image
                            src={p.images.lg}
                            alt={p.name}
                            width={480}
                            height={640}
                            unoptimized
                            className="portrait-photo-real"
                          />
                        ) : (
                          <>
                            <span className="portrait-placeholder-label">
                              Portrait — placeholder
                            </span>
                            <span className="portrait-name-code">
                              {p.callname}
                            </span>
                            <span className="portrait-dim">
                              3:4 ratio · Advisor
                            </span>
                          </>
                        )}
                      </div>
                      <div className="advisor-info">
                        <h2
                          className="member-name"
                          style={{ fontSize: "1.5rem", marginBottom: "6px" }}
                        >
                          {p.name}
                        </h2>
                        <div
                          className="member-role"
                          style={{ fontSize: "0.9375rem", marginBottom: "8px" }}
                        >
                          {p.position || "Faculty Advisor"}
                        </div>
                        {p.major && (
                          <div
                            className="member-major"
                            style={{ marginBottom: "16px" }}
                          >
                            {p.major}
                          </div>
                        )}
                        {p.research && p.research.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginTop: "8px",
                            }}
                          >
                            {p.research.map((r) => (
                              <span key={r} className="meta-tag">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={group.title} className="cohort-block">
              <div className="cohort-header">
                <div className="cohort-title">
                  <span>{group.title}</span>
                  <span className="cohort-badge">{group.badge}</span>
                </div>
                <span className="cohort-count">{group.countLabel}</span>
              </div>

              <div className="members-grid">
                {group.members.map((p) => (
                  <div key={p.slug} className="member-card">
                    <div className="portrait-box">
                      {p.hasRealPhoto ? (
                        <Image
                          src={p.images.lg}
                          alt={p.name}
                          width={480}
                          height={640}
                          unoptimized
                          className="portrait-photo-real"
                        />
                      ) : (
                        <>
                          <span className="portrait-placeholder-label">
                            Portrait — placeholder
                          </span>
                          <span className="portrait-name-code">
                            {p.callname}
                          </span>
                          <span className="portrait-dim">3:4 ratio</span>
                        </>
                      )}
                    </div>
                    <div className="member-info">
                      <h2 className="member-name">{p.name}</h2>
                      <div className="member-role">
                        {p.position || "Research Member"}
                      </div>
                      {p.major ? (
                        <div className="member-major">{p.major}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
