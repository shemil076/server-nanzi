import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from 'src/types/auth';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtUtils {
  constructor(private configService: ConfigService) {}
  verifyAccessToken(token: string): UserPayload {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET not set in config');
    }
    const payload = jwt.verify(token, secret) as unknown as UserPayload;
    return payload;
  }
}
