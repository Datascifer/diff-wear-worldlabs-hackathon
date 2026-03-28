import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

// Configure VAPID at module load — fails loud if keys missing in production.
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:support@diiff.app";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  tag: string;
  url: string;
}

interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// sendToUser — sends a push notification to all active subscriptions for a user.
// On 410 Gone: the subscription has expired — delete it automatically.
export async function sendToUser(
  userId: string,
  payload: PushPayload,
  supabase: SupabaseClient
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[push] VAPID keys not configured — skipping notification");
    return;
  }

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error ?? !subscriptions?.length) return;

  const notification = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (sub: PushSubscriptionRecord) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notification
        );
      } catch (err) {
        // 410 Gone = subscription expired, clean it up
        if (
          err instanceof webpush.WebPushError &&
          (err.statusCode === 410 || err.statusCode === 404)
        ) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint)
            .eq("user_id", userId);
        } else {
          console.error("[push] Send error:", { userId, endpoint: sub.endpoint, err });
        }
      }
    })
  );
}

// Convenience senders called from Edge Functions

export async function sendMorningPrayer(
  userId: string,
  supabase: SupabaseClient
) {
  return sendToUser(userId, {
    title: "Good morning",
    body: "Your daily scripture is ready.",
    tag: "morning-prayer",
    url: "/feed",
  }, supabase);
}

export async function sendEveningDevotional(
  userId: string,
  supabase: SupabaseClient
) {
  return sendToUser(userId, {
    title: "Evening reflection",
    body: "Take a moment before the day ends.",
    tag: "evening-devotional",
    url: "/feed",
  }, supabase);
}
