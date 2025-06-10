// src/modules/merchants/dto/update-channel.dto.ts
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WhatsAppConfig {
  @IsString() token: string;
  @IsString() number: string;
}
class TelegramConfig {
  @IsString() token: string;
  @IsString() botUsername: string;
}

export class UpdateChannelDto {
  @ValidateNested()
  @Type(() => WhatsAppConfig)
  @IsOptional()
  whatsapp?: WhatsAppConfig;
  @IsOptional()
  @IsString()
  apiToken: string;

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
  @ValidateNested()
  @Type(() => TelegramConfig)
  @IsOptional()
  telegram?: TelegramConfig;
  @IsOptional()
  @IsString()
  businessType: string;

  @IsOptional()
  @IsString()
  businessDescription: string;

  @IsOptional()
  @IsString()
  preferredDialect: string;
}
