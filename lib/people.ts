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
  /** Other spellings of the name used on papers, for matching authors. */
  aliases: string[];
  role: Role;
  /** e.g. "K19"; empty for advisors or when not filled in yet */
  cohort: string;
  major: string;
  position: string;
  research: string[];
  links: Partial<Record<"email" | "github" | "scholar" | "researchgate" | "linkedin" | "website", string>>;
  images: { lg: string; sm: string; dither: string };
};

/** The bits client components need — keeps research text out of the hero bundle. */
export type PersonCard = Pick<
  Person,
  "slug" | "name" | "callname" | "role" | "cohort" | "major" | "position" | "images"
> & { papers?: number };

const dir = path.join(process.cwd(), "content/people");

type Raw = {
  name?: string;
  callname?: string;
  aliases?: string[] | string;
  role?: string;
  cohort?: string | number;
  major?: string;
  position?: string;
  research?: string[] | string;
  links?: Person["links"];
};

const list = (v: string[] | string | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).map((s) => String(s).trim()).filter(Boolean);

function load(file: string): Person {
  const slug = file.replace(/\.yml$/, "");
  const raw = (parse(readFileSync(path.join(dir, file), "utf8")) ?? {}) as Raw;
  if (!raw.name) throw new Error(`content/people/${file}: "name" is required`);

  const name = raw.name.trim();
  const role: Role = raw.role === "advisor" || raw.role === "alumni" ? raw.role : "member";
  const cohort = raw.cohort == null ? "" : String(raw.cohort).trim().replace(/^(\d+)$/, "K$1");

  return {
    slug,
    name,
    callname: raw.callname?.trim() || name.split(/\s+/).at(-1)!,
    aliases: list(raw.aliases),
    role,
    cohort,
    major: raw.major?.trim() ?? "",
    position: raw.position?.trim() ?? "",
    research: list(raw.research),
    links: Object.fromEntries(Object.entries(raw.links ?? {}).filter(([, v]) => v)),
    images: {
      lg: `/people/${slug}.jpg`,
      sm: `/people/${slug}-sm.jpg`,
      dither: `/people/${slug}-dither.png`,
    },
  };
}

const roleOrder: Record<Role, number> = { advisor: 0, member: 1, alumni: 2 };
const cohortNumber = (c: string) => Number(c.replace(/\D/g, "")) || 0;
// people without a cohort yet go after every cohort
const cohortOrder = (c: string) => cohortNumber(c) || Number.MAX_SAFE_INTEGER;

let cache: Person[] | null = null;

export function getPeople(): Person[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = readdirSync(dir)
    .filter((f) => f.endsWith(".yml") && !f.startsWith("_"))
    .map(load)
    .sort(
      (a, b) =>
        roleOrder[a.role] - roleOrder[b.role] ||
        cohortOrder(a.cohort) - cohortOrder(b.cohort) ||
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

export function toCard(p: Person, papers?: number): PersonCard {
  const { slug, name, callname, role, cohort, major, position, images } = p;
  return { slug, name, callname, role, cohort, major, position, images, papers };
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
