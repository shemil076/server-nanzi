import { Controller, Get, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('search')
  @Roles(Role.LANDLORD)
  async fetchTenants(@Query('email') email: string) {
    const result = this.tenantService.fetchTenantByEmail(email);
    return result;
  }
}
