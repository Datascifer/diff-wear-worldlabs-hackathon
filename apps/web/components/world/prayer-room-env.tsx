import { WorldCanvas } from "./world-canvas";
import { BreathingOrb } from "./breathing-orb";
import { FloatingScripture } from "./floating-scripture";
import { WORLD_LABS_ENVIRONMENTS } from "../../../../services/world-labs/client";

interface PrayerRoomEnvProps {
  verse: string;
  reference: string;
}

export function PrayerRoomEnv({ verse, reference }: PrayerRoomEnvProps) {
  return (
    <WorldCanvas environment={WORLD_LABS_ENVIRONMENTS.PRAYER_ROOM}>
      <div className="absolute inset-0 flex items-center justify-center">
        <BreathingOrb />
      </div>
      <FloatingScripture verse={verse} reference={reference} />
    </WorldCanvas>
  );
}
