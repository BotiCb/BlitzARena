import { MatchPhase } from "~/utils/types/types";
import { AbstractCustomWebSocketService } from "./custom-websocket.abstract-service";
import { WebSocketMessageType, WebSocketMsg } from "./websocket-types";
import { Player } from "~/utils/models";
import { DetectedPerson } from "~/utils/types/detection-types";

export class MatchWebSocketService extends AbstractCustomWebSocketService {
    private currentRoundHandlerFunction: (round: number) => void = () => {};
    private totalRoundsHandlerFunction: (round: number) => void = () => {};
    private currentMatchPhaseHandlerFunction: (phase: MatchPhase) => void = () => {};
    private timerHandlerFunction: (endsAt: string) => void = () => {};
    private isAbleToShootHandlerFunction: (isAbleToShoot: boolean) => void = () => {};

    setCurrentRoundHandlerFunction = (handler: (round: number) => void) => {
        this.currentRoundHandlerFunction = handler;
    }

    setTotalRoundsHandlerFunction = (handler: (round: number) => void) => {
        this.totalRoundsHandlerFunction = handler;
    }

    setCurrentMatchPhaseHandlerFunction = (handler: (phase: MatchPhase) => void) => {
        this.currentMatchPhaseHandlerFunction = handler;
    }

    setTimerHandlerFunction = (handler: (endsAt: string) => void) => {
        this.timerHandlerFunction = handler;
    }

    setIsAbleToShootHandlerFunction = (handler: (isAbleToShoot: boolean) => void) => {
        this.isAbleToShootHandlerFunction = handler;
    }

    setWebSocketEventListeners(): void {
        this.websocketService.onMessageType('match_phase_info', this.onPhaseInfo);
        this.websocketService.onMessageType('start_countdown', this.onTimerEndsAt);
        this.websocketService.onMessageType('match_phase', this.onMatchPhase);

    }

    

    onPhaseInfo = (message: WebSocketMsg) => {
        const { currentRound, totalRounds, currentPhase, endsAt } = message.data;
        this.timerHandlerFunction(endsAt || '');
        this.currentRoundHandlerFunction(currentRound);
        this.totalRoundsHandlerFunction(totalRounds);
        this.currentMatchPhaseHandlerFunction(currentPhase);
        MatchWebSocketService.isPhaseInfosNeededHandlerFunction(false);
    }

    onTimerEndsAt = (message: WebSocketMsg) => {
        const { endsAt } = message.data;
        this.timerHandlerFunction(endsAt);
    }

    onMatchPhase = (message: WebSocketMsg) => {
       const { currentRound, currentPhase, endsAt } = message.data;
       this.timerHandlerFunction(endsAt || '');
       this.currentRoundHandlerFunction(currentRound);
       this.currentMatchPhaseHandlerFunction(currentPhase);
       AbstractCustomWebSocketService.playersHandlerFunction((players: Player[]) => {
           return players.map((player: Player) => ({ ...player, isReady: false }));
       });
    }

    close(): void {
        
    }

    shoot = (detecedPerson: DetectedPerson | null) => {
        this.websocketService.sendMessage({
            type: WebSocketMessageType.SHOOT,
            data: detecedPerson
        })
    }
    
}