/**
 * World Labs SDK initialization for Diiff.
 *
 * World Labs API is pre-release. This module wraps SDK calls in a typed
 * interface and falls back to deterministic CSS/WebGL placeholders.
 */

export interface WorldLabsConfig {
  projectId: string;
  apiKey: string;
  environment: "development" | "staging" | "production";
}

export interface SpatialEnvironment {
  id: string;
  attach(container: HTMLElement): void;
  detach(): void;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string): void;
  sendEvent(type: string, payload: unknown): void;
}

interface WorldLabsClient {
  createEnvironment(type: string): SpatialEnvironment;
}

function createStubEnvironment(type: string): SpatialEnvironment {
  const listeners = new Map<string, (data: unknown) => void>();

  return {
    id: `env-${type}-${Date.now()}`,
    attach: (container: HTMLElement) => {
      container.setAttribute("data-world-labs-env", type);
      container.style.background =
        "radial-gradient(circle at top, rgba(123,47,255,0.25), rgba(6,12,28,0.95))";
      container.style.backdropFilter = "blur(4px)";
    },
    detach: () => {
      listeners.clear();
    },
    on: (event: string, handler: (data: unknown) => void) => {
      listeners.set(event, handler);
    },
    off: (event: string) => {
      listeners.delete(event);
    },
    sendEvent: (event: string, payload: unknown) => {
      const handler = listeners.get(event);
      if (handler) handler(payload);
    },
  };
}

export function createWorldLabsClient(config: WorldLabsConfig): WorldLabsClient {
  const isEnabled = Boolean(config.projectId);

  if (!isEnabled) {
    return {
      createEnvironment: (type: string) => createStubEnvironment(type),
    };
  }

  // WORLD_LABS_SDK: Replace this wrapper with @worldlabs/sdk client once GA API ships.
  return {
    createEnvironment: (type: string) => createStubEnvironment(type),
  };
}

export const WORLD_LABS_ENVIRONMENTS = {
  PRAYER_ROOM: "diiff-prayer-room-v1",
  IDENTITY_JOURNEY: "diiff-identity-journey-v1",
  COMMUNITY_CAMPFIRE: "diiff-campfire-v1",
} as const;
