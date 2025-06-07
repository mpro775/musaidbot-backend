// src/modules/merchants/dto/update-channel.dto.ts
import { IsOptional, IsString, ValidateNested } from 'class-validator';
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

  @ValidateNested()
  @Type(() => TelegramConfig)
  @IsOptional()
  telegram?: TelegramConfig;
}
