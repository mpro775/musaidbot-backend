import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'معرّف المحادثة', example: '6651abc...' })
  conversationId: string;

  @ApiProperty({ description: 'معرّف التاجر', example: '6631ee7f...' })
  merchantId: string;

  @ApiProperty({
    description: 'دور المرسل',
    example: 'bot',
    enum: ['bot', 'customer'],
  })
  role: 'bot' | 'customer';

  @ApiProperty({
    description: 'نص الرسالة',
    example: 'مرحبًا بك! كيف نقدر نخدمك؟',
  })
  text: string;

  @ApiProperty({
    description: 'القناة المستخدمة',
    example: 'telegram',
    enum: ['whatsapp', 'telegram', 'webchat'],
  })
  channel: string;

  @ApiProperty({
    description: 'بيانات إضافية (اختياري)',
    type: Object,
    required: false,
  })
  metadata?: Record<string, any>;
}
