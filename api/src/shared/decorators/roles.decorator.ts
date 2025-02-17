import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtGuard } from '../guards/jwt-guard';
import { PlayerInGameGuard } from '../guards/player-in-game-guard';
import { ServiceApiGuard } from '../guards/service-api-guard';
import { ServiceApiName } from '../utils/types';


export const UserRole = () => applyDecorators(UseGuards(JwtGuard));

export function ServiceApiRole(serviceName: ServiceApiName) {
    return applyDecorators(
      UseGuards(ServiceApiGuard(serviceName))
    );
  }
export const UserInGameRole = () => applyDecorators(UseGuards(JwtGuard, PlayerInGameGuard));

export const PlayerInGameRole = () => applyDecorators(UseGuards(JwtGuard,PlayerInGameGuard));