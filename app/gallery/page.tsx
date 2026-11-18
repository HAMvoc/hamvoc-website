import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery";
import { getAlbums } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "HAMvọc Lab at work, on stage, around the table and in caps and gowns.",
};

export default async function GalleryPage() {
  const albums = (await getAlbums()).filter((a) => a.photos.length > 0);

  return (
    <main>
      <section className="view-section">
        <div className="eyebrow">Gallery</div>
        <h1 className="section-headline">Life at HAMvọc</h1>
        <p className="section-lead">At work, on stage, around the table and in caps and gowns.</p>
        <Gallery albums={albums} />
      </section>
    </main>
  );
}
