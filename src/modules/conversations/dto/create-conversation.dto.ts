import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class MessageDto {
  @IsString()
  sender: string; // مثلاً 'merchant' أو 'user'
  @IsString()
  text: string;
  @IsOptional()
  timestamp?: Date; // يمكن تركه، ونضبطه في السيرفيس تلقائيًا
}

export class CreateConversationDto {
  @IsString()
  merchantId: string;

  @IsString()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @IsIn(['whatsapp', 'telegram', 'mock', 'sms'])
  channel?: string = 'whatsapp';
}
