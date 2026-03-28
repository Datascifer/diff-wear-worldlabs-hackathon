// Crisis detection — pattern-matches user text for self-harm and crisis language.
// If detected, the content is allowed (never silence a person in crisis) but:
//   - A high-priority moderation flag is created
//   - Crisis resources are included in the API response

// This list is intentionally conservative — it should produce false positives
// rather than miss genuine crisis signals.
const CRISIS_PATTERNS = [
  /\b(kill|hurt|harm)\s+(my)?self\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend\s+my\s+life\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on)\b/i,
  /\bcan('?t|not)\s+take\s+it\s+anymore\b/i,
  /\bthinking\s+about\s+(killing|hurting|ending)\b/i,
  /\bself[\s-]harm\b/i,
  /\bcutting\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
];

export interface CrisisDetectionResult {
  detected: boolean;
  severity: "watch" | "urgent";
}

export const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988" },
  { name: "Crisis Text Line", contact: "Text HOME to 741741" },
  { name: "NYC Well", contact: "1-888-NYC-WELL (1-888-692-9355)" },
  { name: "The Trevor Project (LGBTQ+ youth)", contact: "1-866-488-7386" },
] as const;

export function detectCrisis(text: string): CrisisDetectionResult {
  const urgentMatterns = CRISIS_PATTERNS.slice(0, 7); // most direct indicators
  for (const pattern of urgentMatterns) {
    if (pattern.test(text)) {
      return { detected: true, severity: "urgent" };
    }
  }

  for (const pattern of CRISIS_PATTERNS.slice(7)) {
    if (pattern.test(text)) {
      return { detected: true, severity: "watch" };
    }
  }

  return { detected: false, severity: "watch" };
}
