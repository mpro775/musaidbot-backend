// src/modules/conversations/dto/conversation-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty({ description: 'معرّف المحادثة' })
  _id: string;

  @ApiProperty({ description: 'معرّف التاجر صاحب المحادثة' })
  merchantId: string;

  @ApiProperty({ description: 'معرّف المستخدم أو رقم العميل' })
  userId: string;

  @ApiProperty({
    description: 'تاريخ الإنشاء (ISO 8601)',
    type: String,
    example: new Date().toISOString(),
  })
  createdAt: string; // <-- string بدل Date

  @ApiProperty({
    description: 'تاريخ آخر تعديل (ISO 8601)',
    type: String,
    example: new Date().toISOString(),
  })
  updatedAt: string; // <-- string بدل Date
}
