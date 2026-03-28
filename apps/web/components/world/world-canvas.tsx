"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  createWorldLabsClient,
  WORLD_LABS_ENVIRONMENTS,
  type SpatialEnvironment,
} from "../../../../services/world-labs/client";

interface WorldCanvasProps {
  environment: (typeof WORLD_LABS_ENVIRONMENTS)[keyof typeof WORLD_LABS_ENVIRONMENTS];
  className?: string;
  children?: ReactNode;
}

export function WorldCanvas({ environment, className, children }: WorldCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const client = createWorldLabsClient({
      projectId: process.env.NEXT_PUBLIC_WORLD_LABS_PROJECT_ID ?? "",
      apiKey: "client-runtime",
      environment:
        process.env.NODE_ENV === "production" ? "production" : "development",
    });

    let env: SpatialEnvironment | null = null;

    try {
      env = client.createEnvironment(environment);
      env.attach(container);
      setFallbackActive(false);
    } catch {
      setFallbackActive(true);
      container.setAttribute("data-world-labs-fallback", "true");
    }

    return () => {
      if (env) {
        try {
          env.detach();
        } catch {
          // no-op cleanup fallback
        }
      }
    };
  }, [environment]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="relative h-[300px] w-full overflow-hidden rounded-3xl border border-white/10"
      >
        {fallbackActive ? (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/30 to-slate-950" />
        ) : null}
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
