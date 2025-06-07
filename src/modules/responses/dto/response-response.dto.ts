// src/modules/responses/dto/response-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResponseResponseDto {
  @ApiProperty({ description: 'معرّف الردّ' })
  _id: string;

  @ApiProperty({ description: 'معرّف التاجر' })
  merchantId: string;

  @ApiProperty({ description: 'الكلمة المفتاحية لهذا الردّ' })
  keyword: string;

  @ApiProperty({ description: 'نصّ الردّ' })
  replyText: string;

  @ApiProperty({
    description: 'وقت الإنشاء',
    type: String,
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'وقت التعديل الأخير',
    type: String,
    example: new Date().toISOString(),
  })
  updatedAt: Date;
}
