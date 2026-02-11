import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../auth/user.decorator';
import { UserPayload } from '../types/auth';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Prisma, Role } from '@prisma/client';
import { Roles } from '../auth/role.decorator';
import { NotFoundError } from 'rxjs';
import { UpdataUserDetailDto } from './dto/update-user.dto';

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

  @Patch('updated-user')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @User() user: UserPayload,
    @Body() updateUserDto: UpdataUserDetailDto,
  ) {
    const userWhereUniqueInput: Prisma.UserWhereUniqueInput = {
      id: undefined,
      email: undefined,
    };

    if (user.id) userWhereUniqueInput.id = user.id;
    if (user.email) userWhereUniqueInput.email = user.email;

    if (!userWhereUniqueInput.id && !userWhereUniqueInput.email) {
      throw new NotFoundError('No unique identifier provided');
    }

    return this.userService.updateUserInfo(userWhereUniqueInput, updateUserDto);
  }
}
