import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { getPeople } from "./people";

export type Author = { name: string; slug: string | null };
export type PaperLink = { label: string; href: string };

export type Paper = {
  slug: string;
  area: string;
  title: string;
  authors: Author[];
  venue: string;
  /** e.g. a best-paper award */
  award: string;
  year: number | null;
  /** "2026", "2026-06" or "2026-06-24" — for ordering */
  date: string;
  /** first link is where the title points */
  links: PaperLink[];
};

export type Area = {
  slug: string;
  title: string;
  description: string;
  papers: Paper[];
};

export type VenueGroup = {
  venue: string;
  tag: string;
  papers: Paper[];
};

export type PublicationCategory = {
  id: "journals" | "conferences";
  title: string;
  tag: string;
  count: number;
  venues: VenueGroup[];
};

const dir = path.join(process.cwd(), "content/research");

const LINKS = [
  ["doi", "DOI"],
  ["pdf", "PDF"],
  ["arxiv", "arXiv"],
  ["researchgate", "ResearchGate"],
  ["url", "Link"],
  ["project", "Project"],
  ["code", "Code"],
] as const;

type RawPaper = {
  title?: string;
  authors?: string[] | string;
  venue?: string;
  award?: string;
  year?: number | string;
  date?: string;
  links?: Partial<Record<(typeof LINKS)[number][0], string>>;
};
type RawArea = { title?: string; description?: string; order?: number };

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();
const titleFromFolder = (f: string) =>
  f.replace(/^\d+[-_]/, "").replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

const newestFirst = (a: Paper, b: Paper) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title);

const readYaml = <T,>(file: string): T => (parse(readFileSync(file, "utf8")) ?? {}) as T;

let cache: Area[] | null = null;

/** Every research area (one folder each) with its papers, newest first. */
export function getAreas(): Area[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  if (!existsSync(dir)) return (cache = []);

  // authors are matched on a member's name or any spelling they have published under
  const members = new Map(
    getPeople().flatMap((p) => [p.name, ...p.aliases].map((n) => [norm(n), p.slug] as const)),
  );
  const folders = readdirSync(dir).filter(
    (f) => !f.startsWith("_") && !f.startsWith(".") && statSync(path.join(dir, f)).isDirectory(),
  );

  const areas = folders.map((folder) => {
    const areaDir = path.join(dir, folder);
    const meta = existsSync(path.join(areaDir, "_area.yml"))
      ? readYaml<RawArea>(path.join(areaDir, "_area.yml"))
      : {};

    const papers = readdirSync(areaDir)
      .filter((f) => f.endsWith(".yml") && !f.startsWith("_"))
      .map((file): Paper => {
        const slug = file.replace(/\.yml$/, "");
        const raw = readYaml<RawPaper>(path.join(areaDir, file));
        if (!raw.title) throw new Error(`content/research/${folder}/${file}: "title" is required`);
        const authors = (Array.isArray(raw.authors) ? raw.authors : (raw.authors ?? "").split(","))
          .map((a) => a.trim())
          .filter(Boolean)
          .map((name) => ({ name, slug: members.get(norm(name)) ?? null }));

        const given = { ...raw.links };
        // a PDF dropped next to the .yml is published by scripts/papers.mjs
        if (!given.pdf && existsSync(path.join(areaDir, `${slug}.pdf`))) {
          given.pdf = `/papers/${folder}/${slug}.pdf`;
        }
        const links = LINKS.filter(([k]) => given[k]).map(([k, label]) => ({ label, href: given[k]! }));

        const date = String(raw.date ?? raw.year ?? "").trim();
        const year = Number(date.slice(0, 4));
        return {
          slug,
          area: folder,
          title: raw.title.trim(),
          authors,
          venue: raw.venue?.trim() ?? "",
          award: raw.award?.trim() ?? "",
          year: Number.isFinite(year) && year > 0 ? year : null,
          date,
          links,
        };
      })
      .sort(newestFirst);

    return {
      order: meta.order ?? 999,
      area: {
        slug: folder,
        title: meta.title?.trim() || titleFromFolder(folder),
        description: meta.description?.trim() ?? "",
        papers,
      },
    };
  });

  cache = areas
    .sort((a, b) => a.order - b.order || a.area.title.localeCompare(b.area.title))
    .map((a) => a.area);
  return cache;
}

export function isJournalVenue(venue: string): boolean {
  const v = venue.toLowerCase();
  return (
    v.includes("array") ||
    v.includes("discover") ||
    v.includes("access") ||
    v.includes("journal") ||
    v.includes("transactions") ||
    v.includes("letters")
  );
}

export function getVenueTag(venue: string): string {
  const v = venue.toLowerCase();
  if (v.includes("array")) return "ELSEVIER";
  if (v.includes("discover")) return "SPRINGER NATURE";
  if (v.includes("access")) return "IEEE OPEN ACCESS";
  if (v.includes("ccwc")) return "IEEE CONFERENCE";
  if (v.includes("jcsse")) return "INTERNATIONAL CONFERENCE";
  if (isJournalVenue(venue)) return "PEER-REVIEWED JOURNAL";
  return "PEER-REVIEWED CONFERENCE";
}

export function getResearchPublications(): {
  journals: PublicationCategory;
  conferences: PublicationCategory;
} {
  const allPapers = getAreas().flatMap((a) => a.papers);

  const journalsMap = new Map<string, Paper[]>();
  const confsMap = new Map<string, Paper[]>();

  for (const p of allPapers) {
    const isJ = isJournalVenue(p.venue);
    const targetMap = isJ ? journalsMap : confsMap;
    const existing = targetMap.get(p.venue) ?? [];
    existing.push(p);
    targetMap.set(p.venue, existing);
  }

  const mapToVenues = (m: Map<string, Paper[]>): VenueGroup[] => {
    return Array.from(m.entries())
      .map(([venue, papers]) => ({
        venue,
        tag: getVenueTag(venue),
        papers: papers.sort(newestFirst),
      }))
      .sort((a, b) => a.venue.localeCompare(b.venue));
  };

  const journalVenues = mapToVenues(journalsMap);
  const confVenues = mapToVenues(confsMap);

  const journalCount = journalVenues.reduce((sum, v) => sum + v.papers.length, 0);
  const confCount = confVenues.reduce((sum, v) => sum + v.papers.length, 0);

  return {
    journals: {
      id: "journals",
      title: "Journal Articles",
      tag: `${String(journalCount).padStart(2, "0")} JOURNAL ARTICLE${journalCount === 1 ? "" : "S"}`,
      count: journalCount,
      venues: journalVenues,
    },
    conferences: {
      id: "conferences",
      title: "Conference Papers",
      tag: `${String(confCount).padStart(2, "0")} CONFERENCE PAPER${confCount === 1 ? "" : "S"}`,
      count: confCount,
      venues: confVenues,
    },
  };
}

export function getPapersBy(slug: string): Paper[] {
  return getAreas()
    .flatMap((a) => a.papers)
    .filter((p) => p.authors.some((a) => a.slug === slug))
    .sort(newestFirst);
}

export function getResearchStats() {
  const papers = getAreas().flatMap((a) => a.papers);
  const years = papers.map((p) => p.year).filter((y): y is number => y !== null);
  return {
    papers: papers.length,
    areas: getAreas().length,
    from: years.length ? Math.min(...years) : null,
    to: years.length ? Math.max(...years) : null,
  };
}
