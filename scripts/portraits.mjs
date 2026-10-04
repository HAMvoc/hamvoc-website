// Turns member photos (and the lab group photo, see below) into the images the site uses:
//   public/people/<slug>.jpg          960×1280 greyscale, for the hero and member pages (one file,
//                                               so the hero → member page morph lands on a cached image)
//   public/people/<slug>-sm.jpg       480×640  greyscale, for hover previews
//   public/people/<slug>-dither.png   210×280  1-bit Atkinson dither, shown with pixelated scaling
//
// Source photos live in content/people/photos/<slug>.(jpg|jpeg|png|webp).
// Members without a photo get a generated studio-silhouette placeholder.
// Runs before `dev` and `build`; skips anything already up to date. Pass --force to redo all.

import { readdir, stat, mkdir } from "node:fs/promises";
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

const INK = 11; // #0B0B0B
const PAPER = 241; // #F1F1F1
const DITHER_W = 210;
const DITHER_H = 280;

async function mtime(p) {
  try {
    return (await stat(p)).mtimeMs;
  } catch {
    return 0;
  }
}

async function findPhoto(slug) {
  for (const ext of ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"]) {
    const p = path.join(photoDir, `${slug}.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

// ---------- tone + dither ----------

function atkinson(gray, w, h) {
  const buf = Float32Array.from(gray);
  const out = Buffer.alloc(w * h);
  const spread = (x, y, e) => {
    if (x < 0 || x >= w || y >= h) return;
    buf[y * w + x] += e;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = buf[i];
      const v = old < 128 ? 0 : 255;
      out[i] = v ? PAPER : INK;
      const e = (old - v) / 8;
      spread(x + 1, y, e);
      spread(x + 2, y, e);
      spread(x - 1, y + 1, e);
      spread(x, y + 1, e);
      spread(x + 1, y + 1, e);
      spread(x, y + 2, e);
    }
  }
  return out;
}

async function writeOutputs(slug, input) {
  // `input` is a 1200×1600 greyscale image (any sharp input)
  const base = sharp(input);
  const lg = await base.clone().resize(960, 1280).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  await sharp(lg).toFile(path.join(outDir, `${slug}.jpg`));
  await sharp(lg)
    .resize(480, 640)
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(outDir, `${slug}-sm.jpg`));

  const { data } = await sharp(lg)
    .resize(DITHER_W, DITHER_H, { kernel: "lanczos3" })
    .grayscale()
    .linear(1.15, -14) // a little more contrast so faces survive 1 bit
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bits = atkinson(data, DITHER_W, DITHER_H);
  await sharp(bits, { raw: { width: DITHER_W, height: DITHER_H, channels: 1 } })
    .png({ compressionLevel: 9, palette: true, colors: 2 })
    .toFile(path.join(outDir, `${slug}-dither.png`));
}

async function fromPhoto(photo) {
  return sharp(photo)
    .rotate()
    .resize(1200, 1600, { fit: "cover", position: sharp.strategy.attention })
    .normalise({ lower: 1, upper: 99 })
    .linear(1.06, -6)
    .toBuffer();
}

// ---------- placeholder portrait ----------

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A low-key studio portrait: a dark figure, arms crossed, against a lit grey backdrop,
// picked out by a rim light. Faceless on purpose — it should read as "photo goes here".
function silhouette(slug) {
  const r = rng(hash(slug));
  const W = 900;
  const H = 1200;
  const lit = r() < 0.5 ? -1 : 1; // key light from the left (-1) or right (1)
  const cx = 450 + (r() - 0.5) * 36;
  const headRx = 104 + r() * 18;
  const headRy = headRx * 1.3;
  const headY = 420 + (r() - 0.5) * 36;
  const chinY = headY + headRy;
  const shoulderY = chinY + 110 + r() * 24;
  const sw = 290 + r() * 60; // half shoulder width
  const tilt = (r() - 0.5) * 6;
  const hair = ["short", "side", "long", "bun", "crop"][Math.floor(r() * 5)];
  const jacket = r() < 0.7;
  const neckW = headRx * 0.44;
  const armsY = shoulderY + 240 + r() * 40;
  const L = (v) => (lit < 0 ? v : 100 - v); // mirror a percentage towards the lit side

  const hairLine = {
    short: headY - headRy * 0.28,
    side: headY - headRy * 0.2,
    long: headY - headRy * 0.22,
    bun: headY - headRy * 0.3,
    crop: headY - headRy * 0.52,
  }[hair];
  const sideSweep = hair === "side" ? lit * 26 : 0;

  const behind =
    hair === "long"
      ? `<path d="M ${cx - headRx * 1.12} ${headY - headRy * 0.3}
           C ${cx - headRx * 1.45} ${headY + headRy * 0.9}, ${cx - headRx * 1.55} ${shoulderY + 30}, ${cx - headRx * 1.15} ${shoulderY + 140}
           L ${cx + headRx * 1.15} ${shoulderY + 140}
           C ${cx + headRx * 1.55} ${shoulderY + 30}, ${cx + headRx * 1.45} ${headY + headRy * 0.9}, ${cx + headRx * 1.12} ${headY - headRy * 0.3} Z"
           fill="url(#hair)"/>`
      : hair === "bun"
        ? `<circle cx="${cx - lit * 14}" cy="${headY - headRy - 34}" r="${headRx * 0.5}" fill="url(#hair)"/>`
        : "";

  const torso = `M ${cx - sw - 50} ${H + 20}
    L ${cx - sw - 8} ${shoulderY + 120}
    C ${cx - sw} ${shoulderY + 24}, ${cx - sw + 80} ${shoulderY - 26}, ${cx - neckW - 34} ${shoulderY - 42}
    L ${cx + neckW + 34} ${shoulderY - 42}
    C ${cx + sw - 80} ${shoulderY - 26}, ${cx + sw} ${shoulderY + 24}, ${cx + sw + 8} ${shoulderY + 120}
    L ${cx + sw + 50} ${H + 20} Z`;
  const vDepth = jacket ? 210 : 60;
  const shirt = `M ${cx - neckW - 16} ${shoulderY - 44} L ${cx + neckW + 16} ${shoulderY - 44} L ${cx} ${shoulderY + vDepth} Z`;
  const arms = `M ${cx - sw + 6} ${armsY + 30}
    C ${cx - sw * 0.5} ${armsY - 30}, ${cx + sw * 0.5} ${armsY - 30}, ${cx + sw - 6} ${armsY + 30}
    L ${cx + sw + 4} ${armsY + 180}
    C ${cx + sw * 0.5} ${armsY + 150}, ${cx - sw * 0.5} ${armsY + 150}, ${cx - sw - 4} ${armsY + 180} Z`;
  const headPath = `M ${cx - headRx} ${headY}
    C ${cx - headRx} ${headY - headRy * 1.33}, ${cx + headRx} ${headY - headRy * 1.33}, ${cx + headRx} ${headY}
    C ${cx + headRx} ${headY + headRy * 0.62}, ${cx + headRx * 0.42} ${headY + headRy}, ${cx} ${headY + headRy}
    C ${cx - headRx * 0.42} ${headY + headRy}, ${cx - headRx} ${headY + headRy * 0.62}, ${cx - headRx} ${headY} Z`;
  const crease = `M ${cx - lit * sw * 0.7} ${armsY + 130} C ${cx - lit * sw * 0.1} ${armsY + 40}, ${cx + lit * sw * 0.4} ${armsY + 20}, ${cx + lit * sw * 0.85} ${armsY + 40}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="${L(38)}%" cy="36%" r="78%">
      <stop offset="0" stop-color="#8a8a8a"/>
      <stop offset="0.38" stop-color="#4c4c4c"/>
      <stop offset="0.8" stop-color="#1a1a1a"/>
      <stop offset="1" stop-color="#0d0d0d"/>
    </radialGradient>
    <radialGradient id="face" cx="${L(24)}%" cy="40%" r="85%">
      <stop offset="0" stop-color="#9c9c9c"/>
      <stop offset="0.35" stop-color="#555555"/>
      <stop offset="0.75" stop-color="#1e1e1e"/>
      <stop offset="1" stop-color="#121212"/>
    </radialGradient>
    <linearGradient id="neck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0e0e0e"/>
      <stop offset="0.6" stop-color="#2e2e2e"/>
      <stop offset="1" stop-color="#3a3a3a"/>
    </linearGradient>
    <linearGradient id="body" x1="${L(0) / 100}" y1="0" x2="${L(100) / 100}" y2="0.4">
      <stop offset="0" stop-color="${jacket ? "#2a2a2a" : "#4a4a4a"}"/>
      <stop offset="0.45" stop-color="${jacket ? "#141414" : "#262626"}"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="arms" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${jacket ? "#262626" : "#444444"}"/>
      <stop offset="0.5" stop-color="${jacket ? "#151515" : "#2a2a2a"}"/>
      <stop offset="1" stop-color="#0b0b0b"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a3a3a"/>
      <stop offset="1" stop-color="#8e8e8e"/>
    </linearGradient>
    <radialGradient id="hair" cx="${L(30)}%" cy="18%" r="85%">
      <stop offset="0" stop-color="#2c2c2c"/>
      <stop offset="1" stop-color="#080808"/>
    </radialGradient>
    <linearGradient id="rim" x1="${L(0) / 100}" y1="0" x2="${L(100) / 100}" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="0.28" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="hairClip">
      <path d="M 0 0 H ${W} V ${hairLine + headRy * 0.32 - sideSweep} L ${cx + headRx} ${hairLine + headRy * 0.3 - sideSweep}
               Q ${cx + sideSweep * 2} ${hairLine - headRy * 0.12} ${cx - headRx} ${hairLine + headRy * 0.3 + sideSweep}
               L 0 ${hairLine + headRy * 0.32 + sideSweep} Z"/>
    </clipPath>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>
    <filter id="softer" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g filter="url(#softer)">
    <g transform="rotate(${tilt} ${cx} ${chinY})">${behind}</g>
    <path d="${torso}" fill="url(#body)"/>
    <path d="${shirt}" fill="url(#shirt)"/>
    <rect x="${cx - neckW}" y="${chinY - 70}" width="${neckW * 2}" height="${shoulderY - chinY + 40}" rx="${neckW * 0.7}" fill="url(#neck)"/>
    <path d="${arms}" fill="url(#arms)"/>
    <path d="${crease}" fill="none" stroke="#050505" stroke-width="12" opacity="0.6"/>
  </g>
  <g filter="url(#soft)">
    <g transform="rotate(${tilt} ${cx} ${chinY})">
      <ellipse cx="${cx - headRx * 0.96}" cy="${headY + 20}" rx="18" ry="34" fill="#1c1c1c"/>
      <ellipse cx="${cx + headRx * 0.96}" cy="${headY + 20}" rx="18" ry="34" fill="#1c1c1c"/>
      <path d="${headPath}" fill="url(#face)"/>
      <ellipse cx="${cx}" cy="${headY - headRy * 0.1}" rx="${headRx * 1.07}" ry="${headRy * 0.98}" fill="url(#hair)" clip-path="url(#hairClip)"/>
    </g>
  </g>
  <g filter="url(#glow)" opacity="0.85">
    <path d="${headPath}" fill="none" stroke="url(#rim)" stroke-width="7" transform="rotate(${tilt} ${cx} ${chinY})"/>
    <path d="${torso}" fill="none" stroke="url(#rim)" stroke-width="6"/>
  </g>
</svg>`;
}

async function fromPlaceholder(slug) {
  const W = 1200;
  const H = 1600;
  const art = await sharp(Buffer.from(silhouette(slug)), { density: 96 })
    .resize(W, H)
    .grayscale()
    .png()
    .toBuffer();
  const grain = await sharp({
    create: { width: W, height: H, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 14 } },
  })
    .grayscale()
    .png()
    .toBuffer();
  return sharp(art).composite([{ input: grain, blend: "soft-light" }]).grayscale().toBuffer();
}

// ---------- group photo ----------
//   content/group-photo.(jpg|png|webp)  →  public/group.jpg (1920 wide, colour, its own aspect ratio)
//                                        + public/group-dither.png (480 wide)
// Without a photo, a placeholder is drawn: the lab as dark figures in two rows.

const GROUP_W = 1920;
const GROUP_H = 1080;

function groupSilhouette(slugs) {
  const n = Math.max(slugs.length, 1);
  const back = slugs.slice(0, Math.ceil(n / 2));
  const front = slugs.slice(Math.ceil(n / 2));
  const figure = (slug, cx, baseY, s, tone) => {
    const r = rng(hash(slug));
    const headRx = (58 + r() * 10) * s;
    const headRy = headRx * 1.3;
    const headY = baseY - 330 * s;
    const sw = (150 + r() * 30) * s;
    const shoulderY = headY + headRy + 60 * s;
    const hairDrop = r() < 0.35 ? headRy * 1.1 : 0; // some with longer hair falling past the ears
    return `<g>
      <path d="M ${cx - sw - 20 * s} ${GROUP_H + 20}
        L ${cx - sw} ${shoulderY + 60 * s}
        C ${cx - sw + 6 * s} ${shoulderY}, ${cx - sw * 0.6} ${shoulderY - 20 * s}, ${cx - headRx * 0.6} ${shoulderY - 26 * s}
        L ${cx + headRx * 0.6} ${shoulderY - 26 * s}
        C ${cx + sw * 0.6} ${shoulderY - 20 * s}, ${cx + sw - 6 * s} ${shoulderY}, ${cx + sw} ${shoulderY + 60 * s}
        L ${cx + sw + 20 * s} ${GROUP_H + 20} Z" fill="${tone.body}"/>
      <rect x="${cx - headRx * 0.45}" y="${headY + headRy * 0.6}" width="${headRx * 0.9}" height="${shoulderY - headY - headRy * 0.4}" rx="${headRx * 0.3}" fill="${tone.neck}"/>
      <ellipse cx="${cx}" cy="${headY}" rx="${headRx}" ry="${headRy}" fill="url(#face)"/>
      <path d="M ${cx - headRx * 1.07} ${headY - headRy * 0.12}
        A ${headRx * 1.07} ${headRy * 1.04} 0 0 1 ${cx + headRx * 1.07} ${headY - headRy * 0.12}
        L ${cx + headRx * 1.07} ${headY - headRy * 0.12 + hairDrop}
        L ${cx + headRx * 0.85} ${headY - headRy * 0.12 + hairDrop}
        L ${cx + headRx * 0.85} ${headY - headRy * 0.2}
        L ${cx - headRx * 0.85} ${headY - headRy * 0.2}
        L ${cx - headRx * 0.85} ${headY - headRy * 0.12 + hairDrop}
        L ${cx - headRx * 1.07} ${headY - headRy * 0.12 + hairDrop} Z" fill="${tone.hair}"/>
    </g>`;
  };
  const row = (list, baseY, s, tone, inset) =>
    list
      .map((slug, i) => {
        const span = GROUP_W - inset * 2;
        const cx = inset + (span * (i + 0.5)) / list.length;
        return figure(slug, cx, baseY, s, tone);
      })
      .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${GROUP_W}" height="${GROUP_H}" viewBox="0 0 ${GROUP_W} ${GROUP_H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="75%">
      <stop offset="0" stop-color="#8c8c8c"/>
      <stop offset="0.45" stop-color="#4a4a4a"/>
      <stop offset="1" stop-color="#121212"/>
    </radialGradient>
    <radialGradient id="face" cx="35%" cy="35%" r="85%">
      <stop offset="0" stop-color="#9a9a9a"/>
      <stop offset="0.5" stop-color="#4a4a4a"/>
      <stop offset="1" stop-color="#161616"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="far"><feGaussianBlur stdDeviation="4.5"/></filter>
  </defs>
  <rect width="${GROUP_W}" height="${GROUP_H}" fill="url(#bg)"/>
  <g filter="url(#far)" opacity="0.92">${row(back, 760, 1.0, { body: "#262626", neck: "#202020", hair: "#111" }, 260)}</g>
  <g filter="url(#soft)">${row(front, 1010, 1.25, { body: "#141414", neck: "#1c1c1c", hair: "#0a0a0a" }, 140)}</g>
</svg>`;
}

async function group(slugs, scriptTime) {
  const src = ["jpg", "jpeg", "png", "webp", "JPG", "PNG"]
    .map((e) => path.join(root, `content/group-photo.${e}`))
    .find((p) => existsSync(p));
  const outJpg = path.join(root, "public/group.jpg");
  const outDither = path.join(root, "public/group-dither.png");
  const sourceTime = Math.max(scriptTime, src ? await mtime(src) : 0);
  const outTimes = await Promise.all([outJpg, outDither].map(mtime));
  // the placeholder depends on who is in the lab, so redraw it whenever the people change
  const peopleTime = Math.max(...(await Promise.all(slugs.map((s) => mtime(path.join(peopleDir, `${s}.yml`))))));
  if (!force && outTimes.every((t) => t > Math.max(sourceTime, src ? 0 : peopleTime))) return;

  let base;
  if (src) {
    // keep the photo's own framing — cropping a group shot loses heads
    base = await sharp(src)
      .rotate()
      .resize({ width: GROUP_W, withoutEnlargement: true })
      .toBuffer();
  } else {
    const art = await sharp(Buffer.from(groupSilhouette(slugs))).grayscale().png().toBuffer();
    const grain = await sharp({
      create: { width: GROUP_W, height: GROUP_H, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 12 } },
    })
      .grayscale()
      .png()
      .toBuffer();
    base = await sharp(art).composite([{ input: grain, blend: "soft-light" }]).grayscale().toBuffer();
  }
  // the photo keeps its colour; only the dither it develops from is black and white
  await sharp(base).jpeg({ quality: 82, mozjpeg: true }).toFile(outJpg);
  const { width: bw, height: bh } = await sharp(base).metadata();
  const DW = 480;
  const DH = Math.round((DW * bh) / bw);
  const { data } = await sharp(base)
    .grayscale()
    .resize(DW, DH, { kernel: "lanczos3" })
    .linear(1.15, -14)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  await sharp(atkinson(data, DW, DH), { raw: { width: DW, height: DH, channels: 1 } })
    .png({ compressionLevel: 9, palette: true, colors: 2 })
    .toFile(outDither);
  console.log(`portraits: group photo ${src ? "(photo)" : "(placeholder)"}`);
}

// ---------- main ----------

async function main() {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(peopleDir)).filter((f) => f.endsWith(".yml") && !f.startsWith("_"));
  const scriptTime = await mtime(scriptPath);
  let made = 0;

  for (const file of files) {
    const slug = file.replace(/\.yml$/, "");
    const photo = await findPhoto(slug);
    const sourceTime = Math.max(scriptTime, photo ? await mtime(photo) : 0);
    const outputs = [`${slug}.jpg`, `${slug}-sm.jpg`, `${slug}-dither.png`].map((f) => path.join(outDir, f));
    const outTimes = await Promise.all(outputs.map(mtime));
    if (!force && outTimes.every((t) => t > sourceTime)) continue;

    const input = photo ? await fromPhoto(photo) : await fromPlaceholder(slug);
    await writeOutputs(slug, input);
    made++;
    console.log(`portraits: ${slug} ${photo ? "(photo)" : "(placeholder)"}`);
  }
  console.log(`portraits: ${made} updated, ${files.length - made} up to date`);
  await group(files.map((f) => f.replace(/.yml$/, "")), scriptTime);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
