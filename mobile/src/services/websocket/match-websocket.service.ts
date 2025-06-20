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
    private scoreHandlerFunction: (score: Record<string, number>) => void = () => { };
    private winningTeamHandlerFunction: (team: string | null) => void = () => { };
    private areaTimerHandlerFunction: (endsAt: number | null) => void = () => { };


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

    setScoreHandlerFunction = (handler: (score: Record<string, number>) => void) => {
        this.scoreHandlerFunction = handler;
    }

    setWinningTeamHandlerFunction = (handler: (team: string | null) => void) => {
        this.winningTeamHandlerFunction = handler;
    }

    setAreaTimerHandlerFunction = (handler: (endsAt: number | null) => void) => {
        this.areaTimerHandlerFunction = handler;
    }


    setWebSocketEventListeners(): void {
        this.websocketService.onMessageType('match_phase_info', this.onPhaseInfo);
        this.websocketService.onMessageType('start_countdown', this.onTimerEndsAt);
        this.websocketService.onMessageType('match_phase', this.onMatchPhase);
        this.websocketService.onMessageType('hp_info', this.onHpInfo);
        this.websocketService.onMessageType('eliminated_info', this.onEliminatedInfo);
        this.websocketService.onMessageType('winning_team', this.onWinningTeam);

    }

    onPhaseInfo = (message: WebSocketMsg) => {
        const { currentRound, totalRounds, currentPhase, endsAt, hp, scores } = message.data;
        if (endsAt) {
            this.timerHandlerFunction(MatchWebSocketService.clockSyncService.serverTimeToClient(endsAt));
        }
        else {
            this.timerHandlerFunction(null);
        }

        this.scoreHandlerFunction(scores);
        
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
        const { currentRound, currentPhase, endsAt, scores } = message.data;
        this.currentRoundHandlerFunction(currentRound);
        this.currentMatchPhaseHandlerFunction(currentPhase);
        AbstractCustomWebSocketService.playersHandlerFunction((players: Player[]) => {
            return players.map((player: Player) => ({ ...player, isReady: false, isEliminated: false }));
        });

        this.scoreHandlerFunction(scores);
        this.winningTeamHandlerFunction(null);
        if (endsAt) {
            this.timerHandlerFunction(MatchWebSocketService.clockSyncService.serverTimeToClient(endsAt));
        }
        else {
            this.timerHandlerFunction(null);
        }
        this.healtPointsHandlerFunction(100);
    }

    close(): void {

    }

    onPositionChange = (message: WebSocketMsg) => {
        const { endsAt } = message.data;
        if (endsAt) {
            this.areaTimerHandlerFunction(MatchWebSocketService.clockSyncService.serverTimeToClient(endsAt));
        } else {
            this.areaTimerHandlerFunction(null);
        }
    }



    onHpInfo = (message: WebSocketMsg) => {
        const { hp } = message.data;
        this.healtPointsHandlerFunction(hp);
    }


    onEliminatedInfo = (message: WebSocketMsg) => {
        const { eliminatedBy, eliminatedPlayer } = message.data;
        if(MatchWebSocketService.sessionId === eliminatedPlayer){
            this.healtPointsHandlerFunction(0);
            this.areaTimerHandlerFunction(null);
        }
        AbstractCustomWebSocketService.playersHandlerFunction((players: Player[]) => {
            return players.map((player: Player) => {
                if (player.sessionID === eliminatedPlayer) {
                    return { ...player, deaths: player.deaths + 1, isEliminated: true };
                }
                if (player.sessionID === eliminatedBy) {
                    return { ...player, kills: player.kills + 1 };
                }
                return player;
            });
        });
    }

    onWinningTeam = (message: WebSocketMsg) => {
        const { team } = message.data;
        this.winningTeamHandlerFunction(team);
    }

}