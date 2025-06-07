// src/modules/conversations/dto/conversation-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ description: 'المرسل (customer|bot)' })
  sender: string;

  @ApiProperty({ description: 'نص الرسالة' })
  text: string;

  @ApiProperty({
    description: 'طابع الوقت للرسالة (ISO)',
    type: String,
    example: new Date().toISOString(),
  })
  timestamp: Date;
}

export class ConversationResponseDto {
  @ApiProperty({ description: 'معرّف المحادثة' })
  _id: string;

  @ApiProperty({ description: 'معرّف التاجر صاحب المحادثة' })
  merchantId: string;

  @ApiProperty({ description: 'معرّف المستخدم أو رقم العميل' })
  userId: string;

  @ApiProperty({ type: [MessageDto], description: 'قائمة الرسائل في المحادثة' })
  messages: MessageDto[];

  @ApiProperty({
    description: 'تاريخ الإنشاء',
    type: String,
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'تاريخ آخر تعديل',
    type: String,
    example: new Date().toISOString(),
  })
  updatedAt: Date;
}
