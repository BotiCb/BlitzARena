import { Player } from './models';

import { PlayerInfoResponseDto } from '~/services/restApi/dto/response.dto';
import { PlayerWSInfo } from '~/services/websocket/websocket-types';

export function fromPlayerWSInfoToPlayerModel(playerInfo: PlayerWSInfo): Player {
  return new Player(
    playerInfo.playerId,
    playerInfo.isConnected,
    playerInfo.isHost,
    playerInfo.team,
    playerInfo.kills,
    playerInfo.deaths
  );
}

export function extendPlayer(player: Player, playerInfo: PlayerInfoResponseDto): Player {
  player.firstName = playerInfo.firstName;
  player.lastName = playerInfo.lastName;
  player.photoUrl = playerInfo.photoUrl;

  return player;
}
