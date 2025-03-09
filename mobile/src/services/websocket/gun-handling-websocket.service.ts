import { MatchPhase } from "~/utils/types/types";
import { AbstractCustomWebSocketService } from "./custom-websocket.abstract-service";
import { HitPerson, WebSocketMessageType, WebSocketMsg } from "./websocket-types";
import { Player } from "~/utils/models";
import { DetectedPerson } from "~/utils/types/detection-types";
import { WebSocketService } from "./websocket.service";

export class GunHandlingWebSocketService {
    protected websocketService: WebSocketService = WebSocketService.getInstance();
    

    private isAbleToShootHandlerFunction: (isAbleToShoot: boolean) => void = () => {};

    
    setIsAbleToShootHandlerFunction = (handler: (isAbleToShoot: boolean) => void) => {
        this.isAbleToShootHandlerFunction = handler;
    }

    setWebSocketEventListeners(): void {
        this.websocketService.onMessageType('is_able_to_shoot', this.isAbleToShootHandlerFunction);

    }

    shoot = (detectedPerson: HitPerson | null) => {
        console.log('shoot', detectedPerson);
        this.websocketService.sendMessage({
            type: WebSocketMessageType.SHOOT,
            data: {
                detectedPerson
            }
        })
    }
    
}