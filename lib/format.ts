import type { Person } from "./people";

/** "Advisor", "Alumni · K18" or "K19" */
export function groupLabel(p: Pick<Person, "role" | "cohort">) {
  if (p.role === "advisor") return "Advisor";
  if (p.role === "alumni") return p.cohort ? `Alumni · ${p.cohort}` : "Alumni";
  return p.cohort;
}
