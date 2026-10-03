import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export { groupLabel } from "./format";

export type Role = "advisor" | "member" | "alumni";

export type Person = {
  slug: string;
  name: string;
  /** What people call them — the given name. */
  callname: string;
  /** Other spellings of the name used on papers, for matching authors. */
  aliases: string[];
  role: Role;
  /** e.g. "K6", "K5"; empty for advisors or when not filled in yet */
  cohort: string;
  major: string;
  position: string;
  research: string[];
  links: Partial<Record<"email" | "github" | "scholar" | "researchgate" | "linkedin" | "website", string>>;
  images: { lg: string; sm: string; dither: string };
  hasRealPhoto: boolean;
};

export type MemberGroup = {
  title: string;
  badge: string;
  countLabel: string;
  isAdvisor?: boolean;
  members: Person[];
};

const dir = path.join(process.cwd(), "content/people");
const photoDir = path.join(dir, "photos");

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

export function hasRealPhoto(slug: string): boolean {
  for (const ext of ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"]) {
    if (existsSync(path.join(photoDir, `${slug}.${ext}`))) {
      return true;
    }
  }
  return false;
}

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
    hasRealPhoto: hasRealPhoto(slug),
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
        cohortNumber(b.cohort) - cohortNumber(a.cohort) ||
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

export function getGroupedMembers(): MemberGroup[] {
  const people = getPeople();
  const advisors = people.filter((p) => p.role === "advisor");
  const members = people.filter((p) => p.role !== "advisor");

  const groups: MemberGroup[] = [];

  if (advisors.length > 0) {
    groups.push({
      title: "Advisors",
      badge: "FACULTY ADVISOR",
      countLabel: `${String(advisors.length).padStart(2, "0")} Advisor${advisors.length > 1 ? "s" : ""}`,
      isAdvisor: true,
      members: advisors,
    });
  }

  // Check if members have cohort specified
  const cohortMap = new Map<string, Person[]>();
  const noCohort: Person[] = [];

  for (const m of members) {
    if (m.cohort) {
      const existing = cohortMap.get(m.cohort) ?? [];
      existing.push(m);
      cohortMap.set(m.cohort, existing);
    } else {
      noCohort.push(m);
    }
  }

  // Sort cohorts newest first
  const sortedCohorts = Array.from(cohortMap.entries()).sort(
    ([cA], [cB]) => cohortNumber(cB) - cohortNumber(cA),
  );

  for (const [cohort, cohortMembers] of sortedCohorts) {
    groups.push({
      title: `Cohort ${cohort}`,
      badge: `COHORT ${cohort.toUpperCase()}`,
      countLabel: `${String(cohortMembers.length).padStart(2, "0")} Member${cohortMembers.length > 1 ? "s" : ""}`,
      members: cohortMembers,
    });
  }

  if (noCohort.length > 0) {
    groups.push({
      title: "Members",
      badge: "RESEARCH MEMBERS",
      countLabel: `${String(noCohort.length).padStart(2, "0")} Member${noCohort.length > 1 ? "s" : ""}`,
      members: noCohort,
    });
  }

  return groups;
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
