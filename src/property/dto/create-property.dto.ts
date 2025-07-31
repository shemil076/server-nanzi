import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsUUID()
  landlordId: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  numberOfBeds?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  numberOfBaths?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  landSize?: number;

  @IsOptional()
  @IsString()
  landSizeUnit?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  houseSize?: number;

  @IsOptional()
  @IsBoolean()
  isFurnished?: boolean;

  @IsOptional()
  @IsString()
  apartmentComplex?: string;
}
