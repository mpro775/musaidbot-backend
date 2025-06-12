import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'معرّف المحادثة', example: '6651abc...' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: 'معرّف التاجر', example: '6631ee7f...' })
  @IsString()
  merchantId: string;

  @ApiProperty({
    description: 'دور المرسل',
    example: 'bot',
    enum: ['bot', 'customer'],
  })
  @IsEnum(['bot', 'customer'])
  role: 'bot' | 'customer';

  @ApiProperty({
    description: 'نص الرسالة',
    example: 'مرحبًا بك! كيف نقدر نخدمك؟',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'القناة المستخدمة',
    example: 'telegram',
    enum: ['whatsapp', 'telegram', 'webchat'],
  })
  @IsEnum(['whatsapp', 'telegram', 'webchat'])
  channel: string;

  @ApiProperty({
    description: 'بيانات إضافية (اختياري)',
    type: Object,
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
