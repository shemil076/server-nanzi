import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserPayload } from 'src/types/auth';
import { RequestWithUser } from 'src/types/express';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('User not found in request');
    }
    return request.user;
  },
);
