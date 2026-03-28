import type { AgeTier } from "@/types/domain";

// All age calculations use the current date at call time.
// Edge cases:
//   - Exactly 16 today → eligible (minor)
//   - Exactly 18 today → young_adult
//   - Exactly 26 today → ineligible (one day past the 25th birthday)

export function ageFromDOB(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export function computeAgeTier(dateOfBirth: Date): AgeTier {
  const age = ageFromDOB(dateOfBirth);
  if (age >= 18) {
    return "young_adult";
  }
  return "minor";
}

export function isMinor(ageTier: AgeTier): boolean {
  return ageTier === "minor";
}

export function isEligibleAge(dateOfBirth: Date): boolean {
  const age = ageFromDOB(dateOfBirth);
  // Min: 16 (inclusive). Max: 25 (inclusive). Exactly 26 → false.
  return age >= 16 && age <= 25;
}
