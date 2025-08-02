import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertyService } from './property.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { UserPayload } from 'src/types/auth';
import { UpdatePropertyDto } from './dto/update-property.dt0';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';

@Controller('property')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('create')
  async create(@Body() dto: CreatePropertyDto) {
    return this.propertyService.createProperty(dto);
  }

  @Get()
  @Roles(Role.LANDLORD)
  async getAllProperties(@User() user: UserPayload) {
    return this.propertyService.getPropertyByLandlord(user.id);
  }

  @Get('propertyOverview')
  @Roles(Role.LANDLORD)
  async getPropertiesSummary(@User() user: UserPayload) {
    return this.propertyService.getPropertiesSummaryByUser(user.id);
  }

  @Get(':id')
  @Roles(Role.LANDLORD)
  async getPropertyById(@Param('id') id: string) {
    return this.propertyService.getPropertyById(id);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertyService.update(id, dto);
  }

  @Patch('delete/:id')
  async deactivate(@Param('id') id: string) {
    return this.propertyService.delete(id);
  }
}
