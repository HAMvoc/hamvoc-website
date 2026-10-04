// Turns the photos in content/ into the images the site uses:
//   content/people/photos/<slug>.(jpg|jpeg|png|webp)  →  public/people/<slug>.jpg
//     every portrait is cropped to the same 3:4 frame (960×1280), whatever shape the original is
//   content/group-photo.(jpg|jpeg|png|webp)           →  public/group.jpg (1920 wide, its own framing)
//
// Members without a photo get no image; the site shows their given name instead.
// Runs before `dev` and `build`; skips anything already up to date. Pass --force to redo all.

import { readdir, stat, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const peopleDir = path.join(root, "content/people");
const photoDir = path.join(peopleDir, "photos");
const outDir = path.join(root, "public/people");
const scriptPath = fileURLToPath(import.meta.url);
const force = process.argv.includes("--force");

const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP"];
const PORTRAIT_W = 960;
const PORTRAIT_H = 1280;
const GROUP_W = 1920;

async function mtime(p) {
  try {
    return (await stat(p)).mtimeMs;
  } catch {
    return 0;
  }
}

function findSource(base) {
  return EXTS.map((e) => `${base}.${e}`).find((p) => existsSync(p)) ?? null;
}

async function portrait(photo, out) {
  await sharp(photo)
    .rotate()
    // the face usually sits in the upper half, so crop towards the top rather than the middle
    .resize(PORTRAIT_W, PORTRAIT_H, { fit: "cover", position: "north" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const scriptTime = await mtime(scriptPath);
  const slugs = (await readdir(peopleDir))
    .filter((f) => f.endsWith(".yml") && !f.startsWith("_"))
    .map((f) => f.replace(/\.yml$/, ""));

  const wanted = new Set();
  let made = 0;
  for (const slug of slugs) {
    const photo = findSource(path.join(photoDir, slug));
    if (!photo) continue;
    const out = path.join(outDir, `${slug}.jpg`);
    wanted.add(`${slug}.jpg`);
    if (!force && (await mtime(out)) > Math.max(scriptTime, await mtime(photo))) continue;
    await portrait(photo, out);
    made++;
    console.log(`portraits: ${slug}`);
  }

  // public/people/ is generated: clear out anything that no longer has a source photo
  for (const f of await readdir(outDir)) {
    if (wanted.has(f)) continue;
    // a file still open elsewhere (e.g. in an image viewer on Windows) can't be removed yet
    await unlink(path.join(outDir, f)).catch((err) =>
      console.warn(`portraits: couldn't remove public/people/${f} (${err.code}); remove it by hand`),
    );
  }
  console.log(`portraits: ${made} updated, ${wanted.size} photos in total`);

  const group = findSource(path.join(root, "content/group-photo"));
  const groupOut = path.join(root, "public/group.jpg");
  if (group && (force || (await mtime(groupOut)) <= Math.max(scriptTime, await mtime(group)))) {
    // keep the photo's own framing — cropping a group shot loses heads
    await sharp(group)
      .rotate()
      .resize({ width: GROUP_W, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(groupOut);
    console.log("portraits: group photo");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
