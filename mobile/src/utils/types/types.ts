import { LatLng } from 'react-native-maps';

export type GamePhase = 'lobby' | 'training' | 'game-room' | 'match';

export type TrainingPhase =
  | 'initializing'
  | 'take-photos'
  | 'photos-from-you'
  | 'training-ready-for-group';


export type MatchPhase = 'initializing' | 'waiting-for-players' | 'match' ;
export type Model = {
  path: string;
  mapperArray: Record<number, string>;
};

export enum TEAM {
  RED = 'red',
  BLUE = 'blue',
}

export type GameArea = {
  edges: LatLng[];
  teamBases: { coordinates: LatLng; team: TEAM }[];
};


