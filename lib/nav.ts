// Client-side memory that survives route changes (and resets on reload).
export const navState = {
  /** last person opened from the hero, so going back re-opens their slice */
  lastSlug: null as string | null,
  /** set when a hero slice is clicked: that portrait arrives by morphing, not developing */
  morphSlug: null as string | null,
};
