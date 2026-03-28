"use client";

import { useState } from "react";

const FILTERS = [
  { value: "all",       label: "All" },
  { value: "spirit",    label: "Spirit",    color: "#A855FF", bg: "rgba(168,85,255,0.15)" },
  { value: "move",      label: "Move",      color: "#FF6B00", bg: "rgba(255,107,0,0.15)"  },
  { value: "community", label: "Community", color: "#4DA6FF", bg: "rgba(77,166,255,0.15)" },
  { value: "wellness",  label: "Wellness",  color: "#00D97E", bg: "rgba(0,217,126,0.12)"  },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

interface FeedFilterProps {
  onFilterChange?: (filter: FilterValue) => void;
}

export function FeedFilter({ onFilterChange }: FeedFilterProps) {
  const [active, setActive] = useState<FilterValue>("all");

  const handleSelect = (value: FilterValue) => {
    setActive(value);
    onFilterChange?.(value);
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
      role="tablist"
      aria-label="Feed filter"
    >
      {FILTERS.map((f) => {
        const isActive = active === f.value;
        return (
          <button
            key={f.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(f.value)}
            className="flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap"
            style={
              isActive
                ? {
                    background: f.value === "all" ? "var(--gradient-flame)" : (f as { bg?: string }).bg ?? "var(--gradient-flame)",
                    color: f.value === "all" ? "#000" : (f as { color?: string }).color ?? "#fff",
                    border: "none",
                    boxShadow: f.value === "all" ? "0 2px 12px rgba(255,107,0,0.30)" : "none",
                  }
                : {
                    background: "var(--color-bg-surface)",
                    color: "var(--color-text-tertiary)",
                    border: "1px solid var(--color-border-default)",
                  }
            }
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
