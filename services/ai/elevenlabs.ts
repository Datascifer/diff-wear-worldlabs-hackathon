// ElevenLabs TTS client — server-side only.
// This module must NEVER be imported in client-side code.

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key && process.env.APP_ENV === "production") {
    throw new Error("ELEVENLABS_API_KEY is required in production.");
  }
  return key ?? "";
}

export async function synthesizeSpeech(
  text: string,
  voiceId: string
): Promise<ArrayBuffer> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return new ArrayBuffer(0);
  }

  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `ElevenLabs API returned ${response.status}: ${await response.text()}`
    );
  }

  return response.arrayBuffer();
}
