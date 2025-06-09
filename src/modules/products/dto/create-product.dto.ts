// src/modules/products/dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  originalUrl: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  // الحقول الجديدة
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  lowQuantity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specsBlock?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastFetchedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastFullScrapedAt?: Date;
}
