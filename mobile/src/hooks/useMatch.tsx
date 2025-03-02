import { useEffect, useState } from "react";

import { MatchWebSocketService } from "~/services/websocket/match-websocket.service";
import { MatchPhase } from "~/utils/types/types";
import useCoordinates from "./useCoordinates";

export const useMatch = () => {
  const [round, setRound] = useState<number>(1);
  const [maxRounds, setMaxRounds] = useState<number>(10);
  const [matchPhase, setMatchPhase] = useState<MatchPhase>("initializing");
  const matchWebSocketService = MatchWebSocketService.getInstance();
  const { location } = useCoordinates({
    accuracy: 5,
    timeInterval: 1000,
    distanceInterval: 0,
  });


  useEffect(() => {
    if (location) {
      matchWebSocketService.sendPlayersLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location]);


  useEffect(() => {
    matchWebSocketService.setWebSocketEventListeners();
    matchWebSocketService.setCurrentRoundHandlerFunction(setRound);
    matchWebSocketService.setTotalRoundsHandlerFunction(setMaxRounds);
    matchWebSocketService.setCurrentMatchPhaseHandlerFunction(setMatchPhase);
    matchWebSocketService.readyForPhase();
    return () => {
      matchWebSocketService.close();
    };
  }, []);


  return {
    round,
    maxRounds,
    matchPhase
  };
};
