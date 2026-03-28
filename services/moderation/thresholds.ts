// Perspective API score thresholds.
// Lower = more restrictive. Minor-accessible content uses lower thresholds.

export const MINOR_THRESHOLDS = {
  TOXICITY: 0.6,
  SEVERE_TOXICITY: 0.4,
  IDENTITY_ATTACK: 0.5,
  INSULT: 0.65,
  THREAT: 0.4,
  SEXUALLY_EXPLICIT: 0.3,
} as const;

export const ADULT_THRESHOLDS = {
  TOXICITY: 0.8,
  SEVERE_TOXICITY: 0.6,
  IDENTITY_ATTACK: 0.7,
  INSULT: 0.85,
  THREAT: 0.6,
  SEXUALLY_EXPLICIT: 0.5,
} as const;

export type ThresholdSet = typeof MINOR_THRESHOLDS | typeof ADULT_THRESHOLDS;

export type FlagSeverity = "critical" | "high" | "medium" | "low";

export interface PerspectiveScores {
  toxicity: number;
  severeToxicity: number;
  identityAttack: number;
  insult: number;
  threat: number;
  sexuallyExplicit: number;
}

// classifySeverity — given scores and thresholds, returns a severity level.
export function classifySeverity(
  scores: PerspectiveScores,
  thresholds: ThresholdSet
): FlagSeverity {
  if (
    scores.sexuallyExplicit > 0.8 ||
    scores.threat > 0.7 ||
    scores.severeToxicity > 0.7
  ) {
    return "critical";
  }

  const scoreMap: Array<[number, number]> = [
    [scores.toxicity, thresholds.TOXICITY],
    [scores.severeToxicity, thresholds.SEVERE_TOXICITY],
    [scores.identityAttack, thresholds.IDENTITY_ATTACK],
    [scores.insult, thresholds.INSULT],
    [scores.threat, thresholds.THREAT],
    [scores.sexuallyExplicit, thresholds.SEXUALLY_EXPLICIT],
  ];

  const maxRatio = Math.max(...scoreMap.map(([score, threshold]) => score / threshold));

  if (maxRatio >= 2) return "high";
  if (maxRatio >= 1) return "medium";
  return "low";
}
