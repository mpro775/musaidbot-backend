// src/modules/conversations/dto/create-conversation.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'معرّف التاجر المرتبط بالمحادثة',
    example: '6650f0f4f4b1d9a1b4a421dc',
  })
  @IsString()
  merchantId: string;

  @ApiProperty({
    description: 'رقم المستخدم أو معرّف الزبون (مثل رقم واتساب)',
    example: '9665XXXXXXX',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'القناة المستخدمة (افتراضي: whatsapp)',
    enum: ['whatsapp', 'telegram', 'mock', 'sms'],
    example: 'whatsapp',
  })
  @IsOptional()
  @IsIn(['whatsapp', 'telegram', 'mock', 'sms'])
  channel?: string = 'whatsapp';
}
