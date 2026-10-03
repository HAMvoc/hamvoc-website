import type Lenis from "lenis";

// The page's single Lenis instance, set by <SmoothScroll>. Null when the user prefers reduced motion.
export const smooth: { lenis: Lenis | null } = { lenis: null };
