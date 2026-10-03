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
  year: number | null;
  /** first link is where the title points */
  links: PaperLink[];
};

export type Area = {
  slug: string;
  title: string;
  description: string;
  papers: Paper[];
};

const dir = path.join(process.cwd(), "content/research");

const LINKS = [
  ["pdf", "PDF"],
  ["arxiv", "arXiv"],
  ["doi", "DOI"],
  ["url", "Link"],
  ["project", "Project"],
  ["code", "Code"],
] as const;

type RawPaper = {
  title?: string;
  authors?: string[] | string;
  venue?: string;
  year?: number | string;
  links?: Partial<Record<(typeof LINKS)[number][0], string>>;
};
type RawArea = { title?: string; description?: string; order?: number };

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();
const titleFromFolder = (f: string) =>
  f.replace(/^\d+[-_]/, "").replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

const readYaml = <T,>(file: string): T => (parse(readFileSync(file, "utf8")) ?? {}) as T;

let cache: Area[] | null = null;

/** Every research area (one folder each) with its papers, newest first. */
export function getAreas(): Area[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  if (!existsSync(dir)) return (cache = []);

  const members = new Map(getPeople().map((p) => [norm(p.name), p.slug]));
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

        const year = Number(raw.year);
        return {
          slug,
          area: folder,
          title: raw.title.trim(),
          authors,
          venue: raw.venue?.trim() ?? "",
          year: Number.isFinite(year) && year > 0 ? year : null,
          links,
        };
      })
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));

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

export function getPapersBy(slug: string): Paper[] {
  return getAreas()
    .flatMap((a) => a.papers)
    .filter((p) => p.authors.some((a) => a.slug === slug))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
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
