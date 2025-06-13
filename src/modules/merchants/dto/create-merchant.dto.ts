// src/modules/merchants/dto/create-merchant.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Matches,
  IsUrl,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { PromptConfigDto } from './prompt-config.dto';
import { Type } from 'class-transformer'; // ✅ مهمة جداً!

export class CreateMerchantDto {
  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'رقم الجوال' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'رقم واتساب' })
  @IsOptional()
  @Matches(/^\+?\d{7,15}$/)
  whatsappNumber?: string;

  @ApiPropertyOptional({ description: 'رابط Webhook للبوت' })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiPropertyOptional({ description: 'إعدادات القنوات' })
  @IsOptional()
  channelConfig?: {
    telegram?: { chatId?: string; token?: string };
    whatsapp?: { phone?: string };
  };

  @ApiPropertyOptional({ description: 'تكوين الردود' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PromptConfigDto)
  promptConfig?: PromptConfigDto;

  @ApiPropertyOptional({ description: 'فئة المتجر' })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional({ description: 'وصف المتجر' })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiPropertyOptional({ description: 'سياسة الإرجاع (اختياري)' })
  @IsOptional()
  @IsString()
  returnPolicy?: string;

  @ApiPropertyOptional({ description: 'سياسة الاستبدال (اختياري)' })
  @IsOptional()
  @IsString()
  exchangePolicy?: string;

  @ApiPropertyOptional({ description: 'الفئات / أقسام المنتجات' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
  @ApiPropertyOptional({ description: 'سياسة الشحن والتوصيل (اختياري)' })
  @IsOptional()
  @IsString()
  shippingPolicy?: string;

  @ApiPropertyOptional({ description: 'اللهجة المفضلة' })
  @IsOptional()
  @IsString()
  preferredDialect?: string;
}
