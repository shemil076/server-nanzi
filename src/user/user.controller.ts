import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../auth/user.decorator';
import { UserPayload } from '../types/auth';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/role.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.LANDLORD, Role.LANDLORD)
  async getUserDetails(@User() user: UserPayload) {
    console.log(user.email);
    return this.userService.getUserDetails(user.id);
  }
}
