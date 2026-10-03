// Publishes PDFs kept next to paper files:
//   content/research/<area>/<paper>.pdf  →  public/papers/<area>/<paper>.pdf
// Runs before `dev` and `build`; copies only what changed.

import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "content/research");
const out = path.join(root, "public/papers");

const mtime = async (p) => (await stat(p).catch(() => null))?.mtimeMs ?? 0;

let copied = 0;
if (existsSync(src)) {
  for (const area of await readdir(src, { withFileTypes: true })) {
    if (!area.isDirectory() || area.name.startsWith("_") || area.name.startsWith(".")) continue;
    for (const file of await readdir(path.join(src, area.name))) {
      if (!file.toLowerCase().endsWith(".pdf")) continue;
      const from = path.join(src, area.name, file);
      const to = path.join(out, area.name, file.replace(/\.pdf$/i, ".pdf"));
      if ((await mtime(to)) >= (await mtime(from))) continue;
      await mkdir(path.dirname(to), { recursive: true });
      await copyFile(from, to);
      copied++;
    }
  }
}
console.log(`papers: ${copied} PDF${copied === 1 ? "" : "s"} published`);
