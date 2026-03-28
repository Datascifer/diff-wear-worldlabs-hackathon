import { Resend } from "resend";
import type { ReactElement } from "react";
import { render } from "@react-email/render";

// Validates at call time — not at module load — so local dev without a key still works.
function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.APP_ENV === "production") {
      throw new Error("RESEND_API_KEY is required in production.");
    }
    // In development: log to console instead of sending
    console.warn("[email] RESEND_API_KEY not set — email will not be sent.");
  }
  return new Resend(key ?? "re_test_key");
}

const FROM = process.env.EMAIL_FROM ?? "Diiff <noreply@mail.diiff.app>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "support@diiff.app";

export interface EmailResult {
  sent: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  react: ReactElement
): Promise<EmailResult> {
  const isDev = process.env.APP_ENV !== "production" && process.env.APP_ENV !== "staging";

  if (isDev && !process.env.RESEND_API_KEY) {
    const html = await render(react);
    console.log(`[email:dev] TO: ${to} | SUBJECT: ${subject}`);
    console.log(`[email:dev] Preview HTML length: ${html.length} chars`);
    return { sent: true, id: "dev-preview" };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject,
      react,
    });

    if (error) {
      console.error("[email] Resend error:", { to, subject, error });
      return { sent: false, error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown send error";
    console.error("[email] Unexpected error:", { to, subject, message });
    return { sent: false, error: message };
  }
}
