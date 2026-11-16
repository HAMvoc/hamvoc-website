import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { albums, captions } from "@/content/gallery";

export type Photo = {
  src: string;
  album: string;
  caption: string;
  width: number;
  height: number;
};

export type Album = { slug: string; title: string; description: string; photos: Photo[] };

const root = path.join(process.cwd(), "public/gallery");

// "03-jcsse-2026-tera-rag-talk.jpg" → "Jcsse 2026 tera rag talk", used when no caption is written
const fromFileName = (file: string) => {
  const words = file.replace(/\.[^.]+$/, "").replace(/^\d+-/, "").replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export async function getAlbums(): Promise<Album[]> {
  return Promise.all(
    albums.map(async (a) => {
      let files: string[] = [];
      try {
        files = readdirSync(path.join(root, a.slug)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
      } catch {
        // an album without a folder yet is simply empty
      }
      const photos = await Promise.all(
        files.map(async (file) => {
          const { width = 4, height = 3 } = await sharp(path.join(root, a.slug, file)).metadata();
          return {
            src: `/gallery/${a.slug}/${file}`,
            album: a.slug,
            caption: captions[`${a.slug}/${file}`] ?? fromFileName(file),
            width,
            height,
          };
        }),
      );
      return { ...a, photos };
    }),
  );
}
