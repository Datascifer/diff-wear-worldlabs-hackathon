import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.APP_ENV === "production" ? 0.1 : 0,
  debug: false,
  // Strip PII before sending to Sentry
  beforeSend(event) {
    // Never log email addresses, DOBs, or full names
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});
