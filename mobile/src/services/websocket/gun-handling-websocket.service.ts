import { ClockSyncService } from "../ClockSyncService";
import { HitPerson, WebSocketMessageType, WebSocketMsg } from "./websocket-types";
import { WebSocketService } from "./websocket.service";

export class GunHandlingWebSocketService {

    private static instance: GunHandlingWebSocketService | null = null;

    static getInstance(): GunHandlingWebSocketService {
      if (!GunHandlingWebSocketService.instance) {
        GunHandlingWebSocketService.instance = new GunHandlingWebSocketService();
      }
      return GunHandlingWebSocketService.instance;
    }
    private constructor() {}


    private websocketService: WebSocketService = WebSocketService.getInstance();
    private clockSyncService: ClockSyncService = ClockSyncService.getInstance();
    private ammoInClipHandlerFunction: (ammoInClip: number) => void = () => { };
    private totalAmmoHandlerFunction: (totalAmmo: number) => void = () => { };
    private nextShotAtHandlerFunction: (nextShotAt: number | null) => void = () => { };
     private lastShootTimeStamp : number = 0

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
        this.lastShootTimeStamp = Date.now();
        this.nextShotAtHandlerFunction(null);
        console.log('shoot', detectedPerson);
        this.websocketService.sendMessage({
            type: WebSocketMessageType.SHOOT,
            data: {
                detectedPerson
            }
        })

    }


    reload = () => {
        this.lastShootTimeStamp = Date.now();
        this.websocketService.sendMessage({
            type: WebSocketMessageType.RELOAD_GUN
        })
    }


    onGunInfo = (message: WebSocketMsg) => {
        const { name, ammoInClip, totalAmmo, nextShotAt, createdAt } = message.data;
        if (nextShotAt) {
            const nextShootAtSynced = this.clockSyncService.serverTimeToClient(nextShotAt);
            const createdAtSynced = this.clockSyncService.serverTimeToClient(createdAt);
            const latency = Date.now() - createdAtSynced;
            this.nextShotAtHandlerFunction(nextShootAtSynced-latency);
        }
        this.ammoInClipHandlerFunction(ammoInClip);
        this.totalAmmoHandlerFunction(totalAmmo);
    }
}