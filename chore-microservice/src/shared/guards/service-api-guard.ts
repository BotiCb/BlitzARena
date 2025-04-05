import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Type, mixin } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from '../config/config';
import { Request } from 'express';
import { ServiceApiName } from '../utils/types';

export function ServiceApiGuard(serviceName: ServiceApiName): Type<CanActivate> {
  @Injectable()
  class MixinServiceApiGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: config.get('auth.servicejwtSecret'),
        });
        if (payload.service !== serviceName) {
          throw new UnauthorizedException('Invalid service');
        }
      } catch (error) {
        throw new UnauthorizedException('Token validation failed');
      }

      return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(MixinServiceApiGuard);
}
