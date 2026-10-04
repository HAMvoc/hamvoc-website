import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section
        className="view-section"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div className="eyebrow">[404 // NOT FOUND]</div>
        <h1 className="section-headline">Nothing here to poke at.</h1>
        <p className="section-lead" style={{ marginBottom: "28px" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="meta-tag"
          style={{
            color: "var(--c-red)",
            borderColor: "var(--c-red)",
            backgroundColor: "var(--c-red-tint)",
            padding: "8px 16px",
          }}
        >
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}
