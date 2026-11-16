import type { Person } from "@/lib/people";

/** A member's photo, or a quiet placeholder with their given name until one is added.
 *  Anyone with `grad:` in their profile gets a grad cap and the year in the top-right corner. */
export function Portrait({ person, priority = false }: { person: Person; priority?: boolean }) {
  return (
    <div className="portrait-box">
      {person.hasRealPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photo}
          alt={person.name}
          width={960}
          height={1280}
          loading={priority ? "eager" : "lazy"}
          className="portrait-photo-real"
        />
      ) : (
        <span className="portrait-initial" aria-hidden>
          {person.callname}
        </span>
      )}
      {person.gradYear && <GradBadge year={person.gradYear} />}
    </div>
  );
}

function GradBadge({ year }: { year: number }) {
  return (
    <span className="grad-badge" title={`Class of ${year}`} aria-label={`Graduated, class of ${year}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 6 1 12.5 16 19l15-6.5L16 6Z" fill="currentColor" />
        <path d="M7.5 15.8v5.4c0 1.9 3.8 3.8 8.5 3.8s8.5-1.9 8.5-3.8v-5.4L16 19.5l-8.5-3.7Z" fill="currentColor" />
        <path className="grad-tassel" d="M27 13.6v7.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle className="grad-tassel" cx="27" cy="22" r="1.8" />
      </svg>
      <span className="grad-year">{String(year).slice(-2)}</span>
    </span>
  );
}
