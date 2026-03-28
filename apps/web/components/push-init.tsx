"use client";

import { useEffect } from "react";

// Registers the service worker for Web Push notifications.
// Runs once on app mount, client-side only.
export function PushInit() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[push] Service worker registered:", registration.scope);
      })
      .catch((err) => {
        // Non-fatal — push notifications are optional
        console.warn("[push] Service worker registration failed:", err);
      });
  }, []);

  return null;
}
