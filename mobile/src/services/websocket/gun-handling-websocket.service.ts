import { ClockSyncService } from "../ClockSyncService";
import { HitPerson, WebSocketMessageType, WebSocketMsg } from "./websocket-types";
import { WebSocketService } from "./websocket.service";

export class GunHandlingWebSocketService {
    private websocketService: WebSocketService = WebSocketService.getInstance();
    private clockSyncService: ClockSyncService = ClockSyncService.getInstance();
    private ammoInClipHandlerFunction: (ammoInClip: number) => void = () => { };
    private totalAmmoHandlerFunction: (totalAmmo: number) => void = () => { };
    private nextShotAtHandlerFunction: (nextShotAt: number | null) => void = () => { };

    setNextShotAtHandlerFunction = (handler: (nextShotAt: number | null) => void) => {
        this.nextShotAtHandlerFunction = handler;
    }

    setAmmoInClipHandlerFunction = (handler: (ammoInClip: number) => void) => {
        this.ammoInClipHandlerFunction = handler;
    }

    setTotalAmmoHandlerFunction = (handler: (totalAmmo: number) => void) => {
        this.totalAmmoHandlerFunction = handler;
    }

    setWebSocketEventListeners(): void {
        this.websocketService.onMessageType('gun_info', this.onGunInfo);
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


    reload = () => {
        this.websocketService.sendMessage({
            type: WebSocketMessageType.RELOAD_GUN
        })
    }


    onGunInfo = (message: WebSocketMsg) => {
        const { name, ammoInClip, totalAmmo, nextShotAt } = message.data;
        if (nextShotAt) {
            const nextShootAtSynced = this.clockSyncService.serverTimeToClient(nextShotAt);
            console.log('time difference',
                nextShootAtSynced - Date.now());
            this.nextShotAtHandlerFunction(nextShootAtSynced);
        }
        this.ammoInClipHandlerFunction(ammoInClip);
        this.totalAmmoHandlerFunction(totalAmmo);
    }
}