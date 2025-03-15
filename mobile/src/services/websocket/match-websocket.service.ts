import { MatchPhase } from "~/utils/types/types";
import { AbstractCustomWebSocketService } from "./custom-websocket.abstract-service";
import { WebSocketMessageType, WebSocketMsg } from "./websocket-types";
import { Player } from "~/utils/models";
import { DetectedPerson } from "~/utils/types/detection-types";

export class MatchWebSocketService extends AbstractCustomWebSocketService {
    private currentRoundHandlerFunction: (round: number) => void = () => { };
    private totalRoundsHandlerFunction: (round: number) => void = () => { };
    private currentMatchPhaseHandlerFunction: (phase: MatchPhase) => void = () => { };
    private timerHandlerFunction: (endsAt: number | null) => void = () => { };
    private healtPointsHandlerFunction: (healthPoints: number) => void = () => { };

    setCurrentRoundHandlerFunction = (handler: (round: number) => void) => {
        this.currentRoundHandlerFunction = handler;
    }

    setTotalRoundsHandlerFunction = (handler: (round: number) => void) => {
        this.totalRoundsHandlerFunction = handler;
    }

    setCurrentMatchPhaseHandlerFunction = (handler: (phase: MatchPhase) => void) => {
        this.currentMatchPhaseHandlerFunction = handler;
    }

    setTimerHandlerFunction = (handler: (endsAt: number | null) => void) => {
        this.timerHandlerFunction = handler;
    }

    setHealthPointsHandlerFunction = (handler: (healthPoints: number) => void) => {
        this.healtPointsHandlerFunction = handler;
    }


    setWebSocketEventListeners(): void {
        this.websocketService.onMessageType('match_phase_info', this.onPhaseInfo);
        this.websocketService.onMessageType('start_countdown', this.onTimerEndsAt);
        this.websocketService.onMessageType('match_phase', this.onMatchPhase);
        this.websocketService.onMessageType('hp_info', this.onHpInfo);
        this.websocketService.onMessageType('eliminated_info', this.onEliminatedInfo);

    }

    onPhaseInfo = (message: WebSocketMsg) => {
        const { currentRound, totalRounds, currentPhase, endsAt, hp } = message.data;
        if (endsAt) {
            this.timerHandlerFunction(MatchWebSocketService.clockSyncService.serverTimeToClient(endsAt));
        }
        this.currentRoundHandlerFunction(currentRound);
        this.totalRoundsHandlerFunction(totalRounds);
        this.currentMatchPhaseHandlerFunction(currentPhase);
        MatchWebSocketService.isPhaseInfosNeededHandlerFunction(false);
        if (hp) {
            this.healtPointsHandlerFunction(hp);
        }
    }

    onTimerEndsAt = (message: WebSocketMsg) => {
        const { endsAt } = message.data;
        this.timerHandlerFunction(MatchWebSocketService.clockSyncService.serverTimeToClient(endsAt));
    }

    onMatchPhase = (message: WebSocketMsg) => {
        const { currentRound, currentPhase, endsAt } = message.data;
        this.currentRoundHandlerFunction(currentRound);
        this.currentMatchPhaseHandlerFunction(currentPhase);
        // AbstractCustomWebSocketService.playersHandlerFunction((players: Player[]) => {
        //     return players.map((player: Player) => ({ ...player, isReady: false }));
        // });
        if (endsAt) {
            this.timerHandlerFunction(MatchWebSocketService.clockSyncService.serverTimeToClient(endsAt));
        }
        this.healtPointsHandlerFunction(100);
    }

    close(): void {

    }



    onHpInfo = (message: WebSocketMsg) => {
        const { hp } = message.data;
        this.healtPointsHandlerFunction(hp);
    }


    onEliminatedInfo = (message: WebSocketMsg) => {
        const { eliminatedBy, eliminatedPlayer } = message.data;
        if(MatchWebSocketService.sessionId === eliminatedPlayer){
            this.healtPointsHandlerFunction(0);
        }
    }

}