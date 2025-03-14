import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MatchWebSocketService } from '~/services/websocket/match-websocket.service';
import { MatchPhase } from '~/utils/types/types';
import useCoordinates from '~/hooks/useCoordinates';
import React from 'react'; 
import { HitPerson } from '~/services/websocket/websocket-types';
import { useGunHandling } from '~/hooks/useGunHandling';

type MatchContextType = {
  round: number;
  maxRounds: number;
  matchPhase: MatchPhase;
  matchPhaseEndsAt: string;
  gunHandling: {
      shoot: (detectedPerson: HitPerson | null) => void;
      reload: () => void;
      isAbleToShoot: boolean,
      nextShootAt: string,
      ammoInClip : number,
      totalAmmo: number
    };
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const [round, setRound] = useState<number>(1);
  const [maxRounds, setMaxRounds] = useState<number>(10);
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('initializing');
  const [matchPhaseEndsAt, setMatchPhaseEndsAt] = useState<string>('');
  const matchWebSocketService = MatchWebSocketService.getInstance();
  const gunHandling = useGunHandling();

  const { location } = useCoordinates({
    keepRefreshing: true,
    refreshTimeInterval: 2000,
    options: {
      accuracy: 6,
    },
  });

  useEffect(() => {
    if (location) {
      matchWebSocketService.sendPlayersLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location, matchWebSocketService]);

  useEffect(() => {
    matchWebSocketService.setWebSocketEventListeners();
    matchWebSocketService.setCurrentRoundHandlerFunction(setRound);
    matchWebSocketService.setTotalRoundsHandlerFunction(setMaxRounds);
    matchWebSocketService.setCurrentMatchPhaseHandlerFunction(setMatchPhase);
    matchWebSocketService.setTimerHandlerFunction(setMatchPhaseEndsAt);
    matchWebSocketService.readyForPhase();

    return () => {
      matchWebSocketService.close();
    };
  }, [matchWebSocketService]);

  const value = {
    round,
    maxRounds,
    matchPhase,
    matchPhaseEndsAt,
    gunHandling
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};