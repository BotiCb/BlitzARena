import { applyDecorators, UseGuards } from '@nestjs/common';

import { JwtGuard } from '../guards/jwt-guard';
import { PlayerInGameGuard } from '../guards/player-in-game-guard';

export const UserRole = () => applyDecorators(UseGuards(JwtGuard));

export const UserInGameRole = () => applyDecorators(UseGuards(JwtGuard, PlayerInGameGuard));

export const PlayerInGameRole = () => applyDecorators(UseGuards(JwtGuard,PlayerInGameGuard));