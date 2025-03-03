import { MatchPhase } from "~/utils/types/types";
import { AbstractCustomWebSocketService } from "./custom-websocket.abstract-service";
import { WebSocketMsg } from "./websocket-types";

export class MatchWebSocketService extends AbstractCustomWebSocketService {
    private currentRoundHandlerFunction: (round: number) => void = () => {};
    private totalRoundsHandlerFunction: (round: number) => void = () => {};
    private currentMatchPhaseHandlerFunction: (phase: MatchPhase) => void = () => {};
    private timerHandlerFunction: (endsAt: string) => void = () => {};

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

    setWebSocketEventListeners(): void {
        this.websocketService.onMessageType('match_phase_info', this.onPhaseInfo);
        this.websocketService.onMessageType('start_countdown', this.onTimerEndsAt);
        this.websocketService.onMessageType('match_phase', this.onMatchPhase);

    }

    

    onPhaseInfo = (message: WebSocketMsg) => {
        const { currentRound, totalRounds, currentPhase } = message.data;
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
       const { currentRound, currentPhase } = message.data;
       this.currentRoundHandlerFunction(currentRound);
       this.currentMatchPhaseHandlerFunction(currentPhase);
    }

    close(): void {
        
    }
    
}