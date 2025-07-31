import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUtils } from '../utils/auth.utils';
import { Request } from 'express';
import { RequestWithUser } from 'src/types/express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = req.header('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Malformed or missing token');
    }

    const token = authHeader.split(' ')[1];

    let decoded: { id?: string } | null = null;

    try {
      decoded = this.jwtUtils.verifyAccessToken(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token' + err);
    }

    if (!decoded?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.user = user;
    return true;
  }
}
