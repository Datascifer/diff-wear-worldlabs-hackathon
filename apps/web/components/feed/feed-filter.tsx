"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "spirit", label: "Spirit ✝️" },
  { value: "move", label: "Move 💪" },
  { value: "community", label: "Community 🌍" },
  { value: "wellness", label: "Wellness 🌿" },
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
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={active === value}
          onClick={() => handleSelect(value)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            active === value ? "text-black" : "text-white/50 hover:text-white/80"
          )}
          style={
            active === value
              ? { background: "linear-gradient(135deg, #FFD600, #FF6B00)" }
              : {
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
