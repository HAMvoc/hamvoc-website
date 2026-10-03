import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export { groupLabel } from "./format";

export type Role = "advisor" | "member" | "alumni";

export type Person = {
  slug: string;
  name: string;
  /** What people call them — the given name, set large. */
  callname: string;
  role: Role;
  /** e.g. "K19"; empty for advisors */
  cohort: string;
  major: string;
  position: string | null;
  research: string[];
  keywords: string[];
  links: Partial<Record<"email" | "github" | "scholar" | "linkedin" | "website", string>>;
  images: { lg: string; sm: string; dither: string };
};

/** The bits client components need — keeps research text out of the hero bundle. */
export type PersonCard = Pick<
  Person,
  "slug" | "name" | "callname" | "role" | "cohort" | "major" | "position" | "images"
>;

const dir = path.join(process.cwd(), "content/people");

type Raw = {
  name?: string;
  callname?: string;
  role?: string;
  cohort?: string | number;
  major?: string;
  position?: string;
  research?: string[] | string;
  keywords?: string[];
  links?: Person["links"];
};

function load(file: string): Person {
  const slug = file.replace(/\.yml$/, "");
  const raw = (parse(readFileSync(path.join(dir, file), "utf8")) ?? {}) as Raw;
  if (!raw.name) throw new Error(`content/people/${file}: "name" is required`);

  const name = raw.name.trim();
  const role: Role = raw.role === "advisor" || raw.role === "alumni" ? raw.role : "member";
  const cohort = raw.cohort == null ? "" : String(raw.cohort).trim().replace(/^(\d+)$/, "K$1");
  const research = Array.isArray(raw.research)
    ? raw.research.map((r) => r.trim()).filter(Boolean)
    : raw.research
      ? [raw.research.trim()]
      : [];

  return {
    slug,
    name,
    callname: raw.callname?.trim() || name.split(/\s+/).at(-1)!,
    role,
    cohort,
    major: raw.major?.trim() ?? "",
    position: raw.position?.trim() || null,
    research,
    keywords: (raw.keywords ?? []).map((k) => k.trim()).filter(Boolean),
    links: raw.links ?? {},
    images: {
      lg: `/people/${slug}.jpg`,
      sm: `/people/${slug}-sm.jpg`,
      dither: `/people/${slug}-dither.png`,
    },
  };
}

const roleOrder: Record<Role, number> = { advisor: 0, member: 1, alumni: 2 };
const cohortNumber = (c: string) => Number(c.replace(/\D/g, "")) || 0;

let cache: Person[] | null = null;

export function getPeople(): Person[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = readdirSync(dir)
    .filter((f) => f.endsWith(".yml") && !f.startsWith("_"))
    .map(load)
    .sort(
      (a, b) =>
        roleOrder[a.role] - roleOrder[b.role] ||
        cohortNumber(a.cohort) - cohortNumber(b.cohort) ||
        a.callname.localeCompare(b.callname, "vi"),
    );
  return cache;
}

export function getPerson(slug: string) {
  const people = getPeople();
  const index = people.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return {
    person: people[index],
    index,
    total: people.length,
    prev: people[(index - 1 + people.length) % people.length],
    next: people[(index + 1) % people.length],
  };
}

export function toCard(p: Person): PersonCard {
  const { slug, name, callname, role, cohort, major, position, images } = p;
  return { slug, name, callname, role, cohort, major, position, images };
}

/** Research keywords, most shared first, with the people who listed them. */
export function getTopics() {
  const map = new Map<string, Person[]>();
  for (const p of getPeople()) {
    for (const k of p.keywords) {
      const key = map.has(k) ? k : [...map.keys()].find((x) => x.toLowerCase() === k.toLowerCase()) ?? k;
      map.set(key, [...(map.get(key) ?? []), p]);
    }
  }
  return [...map.entries()]
    .map(([topic, people]) => ({ topic, people }))
    .sort((a, b) => b.people.length - a.people.length || a.topic.localeCompare(b.topic));
}

export function getStats() {
  const people = getPeople();
  const cohorts = [...new Set(people.map((p) => p.cohort).filter(Boolean))].sort(
    (a, b) => cohortNumber(a) - cohortNumber(b),
  );
  return {
    people: people.length,
    cohorts,
    majors: new Set(people.map((p) => p.major).filter(Boolean)).size,
  };
}
