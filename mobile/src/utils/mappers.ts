import { Player } from './models';

import { GameStackParamList } from '~/navigation/types';
import { PlayerInfoResponseDto } from '~/services/restApi/dto/response.dto';
import { PlayerWSInfo } from '~/services/websocket/websocket-types';

export function mergePlayer(wsPlayer: PlayerWSInfo, playerInfo?: PlayerInfoResponseDto): Player {
  return new Player(
    wsPlayer.playerId.trim(),
    playerInfo?.firstName || 'Unknown',
    playerInfo?.lastName || 'Unknown',
    playerInfo?.photoUrl || '',
    wsPlayer.isConnected,
    wsPlayer.isHost,
    wsPlayer.isReady
  );
}

export function mergePlayerArray(
  wsPlayers: PlayerWSInfo[],
  playerInfoList: PlayerInfoResponseDto[]
): Player[] {
  return wsPlayers.map((wsPlayer) => {
    const playerInfo = playerInfoList.find((info) => info.sessionId === wsPlayer.playerId);
    return mergePlayer(wsPlayer, playerInfo);
  });
}
