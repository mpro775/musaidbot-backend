// src/modules/merchants/dto/update-channel.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WhatsAppConfig {
  @ApiPropertyOptional({
    description: 'توكن واتساب',
    example: 'WHATSAPP-TOKEN-123',
  })
  @IsString()
  token: string;

  @ApiPropertyOptional({
    description: 'رقم واتساب المرتبط بالحساب',
    example: '9665XXXXXXX',
  })
  @IsString()
  number: string;
}

class TelegramConfig {
  @ApiPropertyOptional({
    description: 'توكن بوت تيليجرام',
    example: 'BOT:TOKEN:123',
  })
  @IsString()
  token: string;

  @ApiPropertyOptional({ description: 'اسم المستخدم للبوت', example: 'my_bot' })
  @IsString()
  botUsername: string;
}

export class UpdateChannelDto {
  @ApiPropertyOptional({ type: WhatsAppConfig })
  @ValidateNested()
  @Type(() => WhatsAppConfig)
  @IsOptional()
  whatsapp?: WhatsAppConfig;

  @ApiPropertyOptional({
    description: 'رمز الـ API للتاجر',
    example: 'api_ABC123',
  })
  @IsOptional()
  @IsString()
  apiToken: string;

  @ApiPropertyOptional({
    description: 'إعدادات القنوات بتنسيق عام (للدعم الداخلي)',
    example: {
      whatsapp: { phone: '9665XXXXXXX' },
      telegram: { chatId: '123456', botToken: 'bot:TOKEN' },
    },
  })
  @IsOptional()
  @IsObject()
  channelConfig: {
    telegram?: {
      chatId?: string;
      botToken?: string;
    };
    whatsapp?: {
      phone?: string;
    };
  };

  @ApiPropertyOptional({ type: TelegramConfig })
  @ValidateNested()
  @Type(() => TelegramConfig)
  @IsOptional()
  telegram?: TelegramConfig;

  @ApiPropertyOptional({ description: 'نوع النشاط التجاري', example: 'عطور' })
  @IsOptional()
  @IsString()
  businessType: string;

  @ApiPropertyOptional({
    description: 'وصف عام للنشاط التجاري',
    example: 'نبيع العطور الشرقية الفاخرة',
  })
  @IsOptional()
  @IsString()
  businessDescription: string;

  @ApiPropertyOptional({
    description: 'اللهجة المفضلة للردود',
    example: 'خليجي',
  })
  @IsOptional()
  @IsString()
  preferredDialect: string;
}
