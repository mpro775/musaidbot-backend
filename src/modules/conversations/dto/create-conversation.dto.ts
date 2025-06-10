import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  merchantId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsIn(['whatsapp', 'telegram', 'mock', 'sms'])
  channel?: string = 'whatsapp';
}
