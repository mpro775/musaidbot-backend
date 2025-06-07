// src/modules/conversations/dto/add-message.dto.ts
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class AddMessageDto {
  @IsString()
  sender: 'customer' | 'bot';

  @IsString()
  text: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string; // نأخذ String ISO ثم نحوّله في الـ Service
}
