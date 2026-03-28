import { WORLD_LABS_ENVIRONMENTS } from "../../../../services/world-labs/client";
import { WorldCanvas } from "./world-canvas";

interface CampfireEnvProps {
  participantCount: number;
}

export function CampfireEnv({ participantCount }: CampfireEnvProps) {
  return (
    <WorldCanvas environment={WORLD_LABS_ENVIRONMENTS.COMMUNITY_CAMPFIRE}>
      <div className="absolute inset-0 flex items-end justify-center p-6">
        <div className="rounded-full bg-orange-500/70 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(251,146,60,0.45)]">
          Campfire Live • {participantCount}/50
        </div>
      </div>
    </WorldCanvas>
  );
}
