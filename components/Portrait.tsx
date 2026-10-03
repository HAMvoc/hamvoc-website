"use client";

import { ViewTransition, useEffect, useState } from "react";
import type { PersonCard } from "@/lib/people";
import { navState } from "@/lib/nav";

/**
 * Member portrait. Arriving from the hero it morphs in already developed;
 * arriving any other way it develops from the dither, top to bottom.
 */
export function Portrait({ person }: { person: PersonCard }) {
  const [develop] = useState(() => navState.morphSlug !== person.slug);

  useEffect(() => {
    navState.lastSlug = person.slug;
    navState.morphSlug = null;
  }, [person.slug]);

  return (
    <ViewTransition name={`portrait-${person.slug}`} share="morph" default="none">
      <figure className="member-portrait" data-develop={develop || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="portrait-dither" src={person.images.dither} alt="" width={210} height={280} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="portrait-photo"
          src={person.images.lg}
          alt={`Portrait of ${person.name}`}
          width={1200}
          height={1600}
          decoding="sync"
        />
        <span className="slice-scan" />
      </figure>
    </ViewTransition>
  );
}
