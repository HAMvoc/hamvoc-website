import type { Person } from "@/lib/people";

/** A member's photo, or a quiet placeholder with their given name until one is added. */
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
    </div>
  );
}
