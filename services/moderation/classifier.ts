// Perspective API wrapper for text classification.
// Fail-open policy: on API error, content is flagged for manual review rather than blocked.

const PERSPECTIVE_API_BASE = "https://commentanalyzer.googleapis.com/v1alpha1";
const REQUEST_TIMEOUT_MS = 3000;

export interface ClassificationScore {
  toxicity: number;
  threat: number;
  sexuallyExplicit: number;
  identityAttack: number;
}

interface PerspectiveResponse {
  attributeScores?: {
    TOXICITY?: { summaryScore?: { value?: number } };
    THREAT?: { summaryScore?: { value?: number } };
    SEXUALLY_EXPLICIT?: { summaryScore?: { value?: number } };
    IDENTITY_ATTACK?: { summaryScore?: { value?: number } };
  };
}

export async function analyzeText(text: string): Promise<ClassificationScore> {
  const apiKey = process.env.PERSPECTIVE_API_KEY;

  if (!apiKey) {
    // Development: return permissive scores when API key not configured
    return { toxicity: 0, threat: 0, sexuallyExplicit: 0, identityAttack: 0 };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${PERSPECTIVE_API_BASE}/comments:analyze?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: {
            TOXICITY: {},
            THREAT: {},
            SEXUALLY_EXPLICIT: {},
            IDENTITY_ATTACK: {},
          },
          languages: ["en"],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Perspective API returned ${response.status}`);
    }

    const data = (await response.json()) as PerspectiveResponse;
    const scores = data.attributeScores ?? {};

    return {
      toxicity: scores.TOXICITY?.summaryScore?.value ?? 0,
      threat: scores.THREAT?.summaryScore?.value ?? 0,
      sexuallyExplicit: scores.SEXUALLY_EXPLICIT?.summaryScore?.value ?? 0,
      identityAttack: scores.IDENTITY_ATTACK?.summaryScore?.value ?? 0,
    };
  } catch (err) {
    // Fail open: log and flag for manual review rather than blocking
    process.stdout.write(
      JSON.stringify({
        level: "warn",
        event: "perspective_api_error",
        message: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }) + "\n"
    );
    // Return sentinel scores that trigger a manual review flag
    return {
      toxicity: -1,
      threat: -1,
      sexuallyExplicit: -1,
      identityAttack: -1,
    };
  } finally {
    clearTimeout(timeout);
  }
}
