import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (existingUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerUserDto.email,
        password: hashedPassword,
        firstName: registerUserDto.firstName,
        lastName: registerUserDto.lastName,
        role: registerUserDto.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const { accessToken, refreshToken } = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, user };
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refreshUserToken(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      this.generateTokens({
        id: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      }),
      this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('No token');
    }

    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
  }

  private generateTokens(payload: { id: string; email: string; role: string }) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }
}
