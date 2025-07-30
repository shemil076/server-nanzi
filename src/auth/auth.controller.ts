import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { Response, Request } from 'express';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto, @Res() res: Response) {
    try {
        console.log("Register is running");
      const { accessToken, refreshToken, user } =
        await this.authService.registerUser(registerDto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: 'localhost',
      });

      return res.status(HttpStatus.CREATED).json({ accessToken, user });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error as Error });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, user } =
        await this.authService.login(loginDto);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: 'localhost',
      });

      return res.status(HttpStatus.OK).json({ accessToken, user });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error as Error });
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'No refresh token provided' });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.authService.refreshUserToken(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: 'localhost',
      });

      return res.status(HttpStatus.OK).json({ accessToken });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid refresh token' });
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const refreshToken = req.cookies?.refreshToken;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logged out successfully' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server error' });
    }
  }
}
