// src/modules/products/dto/update-product.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
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

  @IsOptional()
  @IsString()
  errorState?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // الحقول الجديدة
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
