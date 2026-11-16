"use client";

import { useCallback, useEffect, useState } from "react";
import type { Album, Photo } from "@/lib/gallery";

export function Gallery({ albums }: { albums: Album[] }) {
  const [active, setActive] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);

  const photos: Photo[] =
    active === "all" ? albums.flatMap((a) => a.photos) : (albums.find((a) => a.slug === active)?.photos ?? []);
  const album = albums.find((a) => a.slug === active);
  const total = albums.reduce((n, a) => n + a.photos.length, 0);

  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="gallery-filters" role="tablist" aria-label="Albums">
        {[{ slug: "all", title: "All", count: total }, ...albums.map((a) => ({ ...a, count: a.photos.length }))].map(
          (a) => (
            <button
              key={a.slug}
              role="tab"
              aria-selected={active === a.slug}
              className={`gallery-filter${active === a.slug ? " active" : ""}`}
              onClick={() => setActive(a.slug)}
            >
              {a.title}
              <span className="gallery-filter-count">{a.count}</span>
            </button>
          ),
        )}
      </div>

      <p className="gallery-album-note" key={`note-${active}`}>
        {album ? album.description : "Every album at once."}
      </p>

      {/* keyed on the album so the grid replays its entrance every time you switch */}
      <div className="gallery-grid" key={active}>
        {photos.map((p, i) => (
          <button
            key={p.src}
            className="gallery-item"
            style={{ "--i": Math.min(i, 12) } as React.CSSProperties}
            onClick={() => setOpen(i)}
            aria-label={`Open photo: ${p.caption}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.caption} width={p.width} height={p.height} loading={i < 6 ? "eager" : "lazy"} />
            <span className="gallery-caption">
              <span className="gallery-caption-album">{albums.find((a) => a.slug === p.album)?.title}</span>
              {p.caption}
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption} onClick={() => setOpen(null)}>
          <figure className="lightbox-figure" key={current.src} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.caption} width={current.width} height={current.height} />
            <figcaption>
              <span>{current.caption}</span>
              <span className="lightbox-count">
                {open! + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
          <button className="lightbox-btn lightbox-close" onClick={() => setOpen(null)} aria-label="Close">
            ✕
          </button>
          {photos.length > 1 && (
            <>
              <button
                className="lightbox-btn lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
              >
                ←
              </button>
              <button
                className="lightbox-btn lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
