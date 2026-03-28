"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  time: string;
  defaultEnabled: boolean;
}

const SETTINGS: NotificationSetting[] = [
  {
    key: "morning_prayer",
    label: "Morning Prayer",
    description: "Start each day with intention",
    time: "7:00 AM",
    defaultEnabled: true,
  },
  {
    key: "evening_devotional",
    label: "Evening Devotional",
    description: "Reflect on the day with gratitude",
    time: "8:00 PM",
    defaultEnabled: true,
  },
  {
    key: "scripture_of_day",
    label: "Scripture of the Day",
    description: "Daily verse in your notification tray",
    time: "9:00 AM",
    defaultEnabled: true,
  },
  {
    key: "workout_reminder",
    label: "Workout Reminder",
    description: "Keep your Move streak alive",
    time: "6:00 PM",
    defaultEnabled: false,
  },
];

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{
        background: enabled
          ? "linear-gradient(135deg, #FFD600, #FF6B00)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
        style={{
          background: "white",
          transform: enabled ? "translateX(26px)" : "translateX(2px)",
        }}
        aria-hidden="true"
      />
    </button>
  );
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SETTINGS.map((s) => [s.key, s.defaultEnabled]))
  );

  const handleToggle = async (key: string) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: { [key]: newValue } }),
    }).catch(() => {
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
    });
  };

  return (
    <Card>
      <h3 className="text-white font-semibold text-sm mb-3">Notifications</h3>
      <div className="space-y-4">
        {SETTINGS.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{setting.label}</p>
              <p className="text-white/40 text-xs">
                {setting.description} · {setting.time}
              </p>
            </div>
            <Toggle
              enabled={settings[setting.key] ?? false}
              onToggle={() => {
                void handleToggle(setting.key);
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
