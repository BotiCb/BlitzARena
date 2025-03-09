import { GunHandlingWebSocketService } from "~/services/websocket/gun-handling-websocket.service";
import { HitPerson } from "~/services/websocket/websocket-types";
import { DetectedPerson } from "~/utils/types/detection-types";

export const useGunHandling = () => {
    const gunHandlingService = new GunHandlingWebSocketService();

    return {
        shoot: (detecedPerson: HitPerson | null) => gunHandlingService.shoot(detecedPerson),
    }
};