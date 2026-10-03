import type { Metadata } from "next";
import { site } from "@/content/site";
import { getAreas } from "@/lib/papers";

export const metadata: Metadata = {
  title: "Home",
  description: site.description,
};

export default function HomePage() {
  const areas = getAreas();

  return (
    <main>
      <section id="home" className="view-section">
        <div className="eyebrow">[HAMVỌC LAB // RESEARCH INITIATIVE]</div>
        <h1 className="section-headline">
          Research born from relentless curiosity.
        </h1>
        <p className="section-lead">
          {site.description}
        </p>

        <div className="home-hero-panel">
          <div className="hero-top-strip">
            <span className="hero-strip-item">STUDENT RESEARCH LAB</span>
            <span className="hero-strip-item">{site.place.toUpperCase()}</span>
            <span className="hero-strip-item">PEER-REVIEWED RESEARCH</span>
          </div>

          <div className="hero-grid">
            <div>
              <p className="hero-intro-text">
                We pursue a hands-on academic discipline: deconstructing foundational
                literature, implementing algorithms from scratch, verifying hypotheses
                with rigorous experiments, and publishing findings at international
                peer-reviewed venues.
              </p>
              <p className="hero-desc-text">
                Our active research tracks span Computer Vision, Medical AI,
                Time-Series Forecasting for Industrial Systems, and Multilingual Language
                Models with Retrieval.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {areas.map((a) => (
                  <span key={a.slug} className="meta-tag">
                    {a.title}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="hero-meta-box">
                <div className="meta-row">
                  <span className="meta-row-label">Organization</span>
                  <span className="meta-row-value">{site.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-row-label">Location</span>
                  <span className="meta-row-value">{site.place}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-row-label">Primary Scope</span>
                  <span className="meta-row-value">Machine Learning & Applied AI</span>
                </div>
                <div className="meta-row">
                  <span className="meta-row-label">Publication Venues</span>
                  <span className="meta-row-value">IEEE · Springer Nature · Elsevier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Group Photo Placeholders */}
        <div className="home-section-header">
          <h2 className="home-section-title">Research Activities & Group Photos</h2>
          <span className="meta-tag">3 ACTIVITY PHOTOS // PLACEHOLDER</span>
        </div>

        <div className="photos-container">
          {/* Photo 1 */}
          <div className="photo-card">
            <div className="photo-box ratio-16-9">
              <span className="placeholder-badge">Group photo — placeholder</span>
              <span className="placeholder-spec">16:9 Aspect Ratio · Full Lab</span>
              <span className="placeholder-note">Annual lab gathering & research review</span>
            </div>
            <div className="photo-caption">
              <div className="photo-title">Annual Academic Review</div>
              <div className="photo-desc">
                Reviewing milestones across research tracks and roadmapping upcoming
                international publication submissions.
              </div>
            </div>
          </div>

          {/* Photo 2 */}
          <div className="photo-card">
            <div className="photo-box ratio-16-9">
              <span className="placeholder-badge">Group photo — placeholder</span>
              <span className="placeholder-spec">16:9 Aspect Ratio · Conference Sessions</span>
              <span className="placeholder-note">Authors at IEEE CCWC & JCSSE</span>
            </div>
            <div className="photo-caption">
              <div className="photo-title">International Conference Presentations</div>
              <div className="photo-desc">
                Lab members presenting accepted research and discussing findings
                with international peers.
              </div>
            </div>
          </div>

          {/* Photo 3 */}
          <div className="photo-card">
            <div className="photo-box ratio-3-2">
              <span className="placeholder-badge">Group photo — placeholder</span>
              <span className="placeholder-spec">3:2 Aspect Ratio · Working Session</span>
              <span className="placeholder-note">Model training & experimentation</span>
            </div>
            <div className="photo-caption">
              <div className="photo-title">Collaborative Prototyping</div>
              <div className="photo-desc">
                Benchmarking baselines, analyzing long-tailed distributions, and
                fine-tuning deep learning architectures.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
