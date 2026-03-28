import { synthesizeSpeech } from "./elevenlabs";
import { SCRIPTURE_LIST } from "./scripture-list";

export type { Scripture } from "./scripture-list";

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getDailyIndex(date: Date): number {
  return getDayOfYear(date) % SCRIPTURE_LIST.length;
}

export interface ScriptureResult {
  verse: string;
  reference: string;
  audioUrl: string | null;
}

// getDailyScripture — returns the scripture for a given date with optional TTS audio.
// Audio is cached in Supabase Storage (audio-cache bucket) by date key.
// If synthesis fails, scripture is still returned (audio is enhancement only).
export async function getDailyScripture(
  date: Date,
  options?: { supabaseServiceClient?: import("@supabase/supabase-js").SupabaseClient }
): Promise<ScriptureResult> {
  const index = getDailyIndex(date);
  const scripture = SCRIPTURE_LIST[index] ?? SCRIPTURE_LIST[0]!;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return { verse: scripture.verse, reference: scripture.reference, audioUrl: null };
  }

  const dateKey = date.toISOString().substring(0, 10); // YYYY-MM-DD
  const cacheKey = `scripture-${dateKey}.mp3`;

  // Try Supabase Storage cache first
  if (options?.supabaseServiceClient) {
    const { data: signedUrl } = await options.supabaseServiceClient.storage
      .from("audio-cache")
      .createSignedUrl(cacheKey, 86400); // 24hr expiry — matches scripture rotation

    if (signedUrl?.signedUrl) {
      return {
        verse: scripture.verse,
        reference: scripture.reference,
        audioUrl: signedUrl.signedUrl,
      };
    }

    // Not cached — synthesize and store
    try {
      const text = `${scripture.verse} — ${scripture.reference}`;
      const audioBuffer = await synthesizeSpeech(text, voiceId);

      if (audioBuffer.byteLength > 0) {
        await options.supabaseServiceClient.storage
          .from("audio-cache")
          .upload(cacheKey, audioBuffer, { contentType: "audio/mpeg", upsert: false });

        const { data: freshUrl } = await options.supabaseServiceClient.storage
          .from("audio-cache")
          .createSignedUrl(cacheKey, 86400);

        return {
          verse: scripture.verse,
          reference: scripture.reference,
          audioUrl: freshUrl?.signedUrl ?? null,
        };
      }
    } catch (e) {
      console.error("[ai/scripture] Synthesis or cache failed:", e);
    }

    return { verse: scripture.verse, reference: scripture.reference, audioUrl: null };
  }

  // Fallback: no storage client — return base64 data URL (dev mode)
  try {
    const text = `${scripture.verse} — ${scripture.reference}`;
    const audioBuffer = await synthesizeSpeech(text, voiceId);

    if (audioBuffer.byteLength === 0) {
      return { verse: scripture.verse, reference: scripture.reference, audioUrl: null };
    }

    const base64 = Buffer.from(audioBuffer).toString("base64");
    return {
      verse: scripture.verse,
      reference: scripture.reference,
      audioUrl: `data:audio/mpeg;base64,${base64}`,
    };
  } catch {
    return { verse: scripture.verse, reference: scripture.reference, audioUrl: null };
  }
}

const WORKOUT_SCRIPTS: Record<string, string> = {
  cardio:
    "Begin your run by speaking today's scripture aloud. With each mile, release one worry to God. His strength, not yours — let that truth carry you forward.",
  strength:
    "Your body is a temple. Train it with purpose and gratitude. Every rep is an act of stewardship. Push through — not because you have to, but because you get to.",
  flexibility:
    "Breathe in slowly and release. Be still and know that He is God. Let your body and spirit find rest in this moment of stillness.",
  breathwork:
    "Breathe in for four counts. Hold. Release for eight. You were given this breath. Return it in prayer. Let each cycle draw you closer to peace.",
};

export async function getWorkoutNarration(
  planType: string
): Promise<{ audioUrl: string | null }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) return { audioUrl: null };

  const script = WORKOUT_SCRIPTS[planType] ?? WORKOUT_SCRIPTS["cardio"]!;

  try {
    const audioBuffer = await synthesizeSpeech(script, voiceId);
    if (audioBuffer.byteLength === 0) return { audioUrl: null };
    const base64 = Buffer.from(audioBuffer).toString("base64");
    return { audioUrl: `data:audio/mpeg;base64,${base64}` };
  } catch {
    return { audioUrl: null };
  }
}
