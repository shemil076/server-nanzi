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

@Controller('property')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('create')
  async create(@Body() dto: CreatePropertyDto) {
    return this.propertyService.createProperty(dto);
  }

  @Get()
  async getAllProperties(@User() user: UserPayload) {
    return this.propertyService.getPropertyByLandlord(user.id);
  }

  @Get('propertyOverview')
  async getPropertiesSummary(@User() user: UserPayload) {
    return this.propertyService.getPropertiesSummaryByUser(user.id);
  }

  @Get(':id')
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
