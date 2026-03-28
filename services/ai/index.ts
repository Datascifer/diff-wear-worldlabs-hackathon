import { synthesizeSpeech } from "./elevenlabs";

// Curated scripture list — date-seeded daily rotation.
const SCRIPTURES = [
  {
    verse: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13",
  },
  {
    verse: "For God gave us a spirit not of fear but of power and love and self-control.",
    reference: "2 Timothy 1:7",
  },
  {
    verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31",
  },
  {
    verse: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.",
    reference: "Joshua 1:9",
  },
  {
    verse: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    verse: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28",
  },
  {
    verse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.",
    reference: "Romans 12:2",
  },
  {
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.",
    reference: "Jeremiah 29:11",
  },
  {
    verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    reference: "Galatians 6:9",
  },
  {
    verse: "The name of the Lord is a fortified tower; the righteous run to it and are safe.",
    reference: "Proverbs 18:10",
  },
  {
    verse: "Create in me a pure heart, O God, and renew a steadfast spirit within me.",
    reference: "Psalm 51:10",
  },
];

function getDailyIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % SCRIPTURES.length;
}

export async function getDailyScripture(date: Date): Promise<{
  verse: string;
  reference: string;
  audioUrl: string | null;
}> {
  const index = getDailyIndex(date);
  const scripture = SCRIPTURES[index] ?? SCRIPTURES[0]!;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return {
      verse: scripture.verse,
      reference: scripture.reference,
      audioUrl: null,
    };
  }

  try {
    const text = `${scripture.verse} — ${scripture.reference}`;
    const audioBuffer = await synthesizeSpeech(text, voiceId);

    if (audioBuffer.byteLength === 0) {
      return {
        verse: scripture.verse,
        reference: scripture.reference,
        audioUrl: null,
      };
    }

    // In production, upload buffer to Supabase Storage and return a signed URL.
    // At launch, we return a base64 data URL for simplicity.
    const base64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return { verse: scripture.verse, reference: scripture.reference, audioUrl };
  } catch {
    return {
      verse: scripture.verse,
      reference: scripture.reference,
      audioUrl: null,
    };
  }
}

export async function getWorkoutNarration(
  workoutId: string
): Promise<{ audioUrl: string | null }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) return { audioUrl: null };

  const scripts: Record<string, string> = {
    "1": "Begin your morning breathwork. Breathe in slowly for four counts, hold for four, and release for four. Let this rhythm center you in the presence of God.",
    "2": "It is time for your upper body workout. Your body is a temple. Train with purpose and gratitude.",
    "3": "An evening walk. Use this time to reflect, pray, and be present. Walk with intention.",
    "4": "Flexibility and stillness. Be still and know that He is God. Let your body and spirit rest in this truth.",
  };

  const script = scripts[workoutId];
  if (!script) return { audioUrl: null };

  try {
    const audioBuffer = await synthesizeSpeech(script, voiceId);
    if (audioBuffer.byteLength === 0) return { audioUrl: null };
    const base64 = Buffer.from(audioBuffer).toString("base64");
    return { audioUrl: `data:audio/mpeg;base64,${base64}` };
  } catch {
    return { audioUrl: null };
  }
}
