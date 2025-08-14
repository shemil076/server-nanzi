import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TenantInvitationService } from './tenant-invitation.service';
import { Role } from '@prisma/client';
import { Roles } from '../auth/role.decorator';
import { Public } from '../auth/public.decorator';
import { CreateTenantInvitationDto } from './dto/create-invitation.dto';
import { User } from '../auth/user.decorator';
import { UserPayload } from '../types/auth';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('tenant-invitation')
@UseGuards(JwtAuthGuard, RoleGuard)
export class TenantInvitationController {
  constructor(
    private readonly tenantInvitationService: TenantInvitationService,
  ) {}

  @Post('send-invitation')
  @Roles(Role.LANDLORD)
  async sendInvitation(
    @Body() dto: CreateTenantInvitationDto,
    @User() user: UserPayload,
  ) {
    console.log('running this =>');
    return this.tenantInvitationService.createTenantInvitation(dto, user.id);
  }

  @Public()
  @Get('verify')
  async verifyToken(@Query('token') token: string) {
    return this.tenantInvitationService.verifyInvitationToken(token);
  }
}
