import Link from "next/link";

export default function NotFound() {
  return (
    <main className="member" data-theme="dark" style={{ minHeight: "80svh", display: "grid", alignContent: "center" }}>
      <p className="label" style={{ color: "var(--color-smoke)" }}>
        404
      </p>
      <h1 className="definition-word" style={{ marginTop: 16 }}>
        Nothing here to poke at.
      </h1>
      <p className="label" style={{ marginTop: 32 }}>
        <Link className="link-u" href="/">
          ← Back to the lab
        </Link>
      </p>
    </main>
  );
}
