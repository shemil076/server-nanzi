import { Body, Controller, Post } from '@nestjs/common';
import { TenantInvitationService } from './tenant-invitation.service';
import { Role } from '@prisma/client';
import { Roles } from '../auth/role.decorator';
import { CreateTenantInvitationDto } from './dto/create-invitation.dto';

@Controller('tenant-invitation')
export class TenantInvitationController {
  constructor(
    private readonly tenantInvitationService: TenantInvitationService,
  ) {}

  @Post('send-invitation')
  @Roles(Role.LANDLORD)
  async sendInvitation(@Body() dto: CreateTenantInvitationDto) {
    console.log('running this =>');
    return this.tenantInvitationService.createTenantInvitation(dto);
  }
}
