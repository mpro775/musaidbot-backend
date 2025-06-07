// src/modules/conversations/dto/add-message.dto.ts
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';

export class AddMessageDto {
  @IsString() sender: 'customer' | 'bot';
  @IsString() text: string;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestamp?: Date;
  @IsOptional()
  @IsIn(['whatsapp', 'telegram', 'mock', 'sms'])
  channel?: 'whatsapp' | 'telegram' | 'mock' | 'sms';
}
