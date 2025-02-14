import { Player } from './models';

export const isMe = (player: Player | null, sessionId: string) => {
  return player && player.sessionID === sessionId;
};
