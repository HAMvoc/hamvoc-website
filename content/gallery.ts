// Gallery albums. Each album is a folder in public/gallery/<slug>/ — drop photos in and they show up.
// Name photos "NN-short-description.jpg": NN sets the order, the rest becomes the caption
// unless a nicer one is written below. Keep photos at most ~2000px on the long side.
export const albums = [
  { slug: "work", title: "Work", description: "Heads down, laptops open." },
  { slug: "presentations", title: "Presentations", description: "Talks, conferences and awards." },
  { slug: "bonding", title: "Bonding", description: "Food, trips and everything in between." },
  { slug: "graduation", title: "Graduation", description: "Caps off to the class." },
] as const;

/** Optional captions, keyed by "<album>/<file name>". */
export const captions: Record<string, string> = {
  "work/01-cafe-session.jpg": "Working session at a café",
  "work/02-cafe-session-2.jpg": "Working session at a café",
  "work/03-lab-session.jpg": "Lab session on campus",
  "work/04-lab-session-2.jpg": "Lab session on campus",
  "presentations/01-jcsse-2026-team.jpg": "The team at JCSSE 2026",
  "presentations/02-jcsse-2026-tera-rag-talk.jpg": "Presenting TERA-RAG at JCSSE 2026",
  "presentations/04-jcsse-2026-tera-rag-slides.jpg": "TERA-RAG architecture, JCSSE 2026",
  "presentations/07-jcsse-2026-macrovision-talk.jpg": "Presenting MacroVision at JCSSE 2026",
  "presentations/08-jcsse-2026-macrovision-talk-2.jpg": "MacroVision: conclusion and future work",
  "presentations/09-fpt-talk-gloss-preprocessing.jpg": "Talk at FPT University",
  "presentations/10-fpt-talk-spam-review-llms.jpg": "Detecting spam reviews using LLMs, FPT University",
  "presentations/11-recognition-ceremony.jpg": "Recognition Ceremony",
  "bonding/01-team-dinner.jpg": "Team dinner",
  "bonding/02-hotpot-dinner.jpg": "Hotpot night",
  "bonding/03-cafe-hangout.jpg": "Catching up over drinks",
  "bonding/04-wind-farm-trip.jpg": "Trip to the wind farm",
  "bonding/05-jcsse-2026-selfie.jpg": "Selfie break at JCSSE 2026",
  "bonding/06-jcsse-2026-mirror-selfie.jpg": "Mirror selfie at JCSSE 2026",
  "graduation/01-class-of-2026-group.jpg": "Class of 2026",
  "graduation/02-class-of-2026-ceremony.jpg": "Graduation ceremony, Class of 2026",
};
