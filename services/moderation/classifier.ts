// OpenAI Moderation API wrapper for text classification.
// Replaces the deprecated Perspective API (sunset 2025).
// Fail-open policy: on API error, content is flagged for manual review rather than blocked.

const OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations";
const REQUEST_TIMEOUT_MS = 3000;

export interface ClassificationScore {
  toxicity: number;
  threat: number;
  sexuallyExplicit: number;
  identityAttack: number;
  // Additional OpenAI categories
  selfHarm: number;
  sexualMinors: number;
}

interface OpenAIModerationResult {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: {
      hate: boolean;
      "hate/threatening": boolean;
      harassment: boolean;
      "harassment/threatening": boolean;
      "self-harm": boolean;
      "self-harm/intent": boolean;
      "self-harm/instructions": boolean;
      sexual: boolean;
      "sexual/minors": boolean;
      violence: boolean;
      "violence/graphic": boolean;
    };
    category_scores: {
      hate: number;
      "hate/threatening": number;
      harassment: number;
      "harassment/threatening": number;
      "self-harm": number;
      "self-harm/intent": number;
      "self-harm/instructions": number;
      sexual: number;
      "sexual/minors": number;
      violence: number;
      "violence/graphic": number;
    };
  }>;
}

export async function analyzeText(text: string): Promise<ClassificationScore> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Development: return permissive scores when API key not configured
    return {
      toxicity: 0,
      threat: 0,
      sexuallyExplicit: 0,
      identityAttack: 0,
      selfHarm: 0,
      sexualMinors: 0,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_MODERATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        input: text,
        model: "omni-moderation-latest",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Moderation API returned ${response.status}`);
    }

    const data = (await response.json()) as OpenAIModerationResult;
    const scores = data.results[0]?.category_scores;

    if (!scores) {
      throw new Error("OpenAI Moderation API returned no results");
    }

    // Map OpenAI categories to our ClassificationScore interface
    // toxicity = max of hate + harassment scores
    // threat = max of threatening variants + violence
    // sexuallyExplicit = sexual score
    // identityAttack = hate score
    return {
      toxicity: Math.max(scores.hate, scores.harassment),
      threat: Math.max(
        scores["hate/threatening"],
        scores["harassment/threatening"],
        scores.violence
      ),
      sexuallyExplicit: scores.sexual,
      identityAttack: scores.hate,
      selfHarm: Math.max(
        scores["self-harm"],
        scores["self-harm/intent"],
        scores["self-harm/instructions"]
      ),
      // sexual/minors is always a critical violation regardless of age_tier
      sexualMinors: scores["sexual/minors"],
    };
  } catch (err) {
    // Fail open: log and flag for manual review rather than blocking
    process.stdout.write(
      JSON.stringify({
        level: "warn",
        event: "openai_moderation_error",
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
      selfHarm: -1,
      sexualMinors: -1,
    };
  } finally {
    clearTimeout(timeout);
  }
}
