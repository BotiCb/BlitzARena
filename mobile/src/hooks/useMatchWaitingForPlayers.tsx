import { useEffect, useState } from "react";
import { MatchWebSocketService } from "~/services/websocket/match-websocket.service";

export const useMatchWaitingForPlayers = () => {
    const [timerEndsAt, setTimerEndsAt] = useState<string>('');
    const matchWebsocketService = MatchWebSocketService.getInstance();

    useEffect(() => {   
        matchWebsocketService.setTimerHandlerFunction(setTimerEndsAt);
    }, [])
    return {
        timerEndsAt
    }
};