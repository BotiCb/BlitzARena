import { HitPerson, WebSocketMessageType, WebSocketMsg } from "./websocket-types";
import { WebSocketService } from "./websocket.service";

export class GunHandlingWebSocketService {
    protected websocketService: WebSocketService = WebSocketService.getInstance();

    private ammoInClipHandlerFunction: (ammoInClip: number) => void = () => { };
    private totalAmmoHandlerFunction: (totalAmmo: number) => void = () => { };
    private nextShotAtHandlerFunction: (nextShotAt: string) => void = () => { };

    setNextShotAtHandlerFunction = (handler: (nextShotAt: string) => void) => {
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
        const nextShotAtDate = new Date(nextShotAt);
        console.log('onGunInfo', name, ammoInClip, totalAmmo,nextShotAt, nextShotAtDate.getTime() - Date.now());        this.nextShotAtHandlerFunction(nextShotAt);
        this.ammoInClipHandlerFunction(ammoInClip);
        this.totalAmmoHandlerFunction(totalAmmo);
    }
}