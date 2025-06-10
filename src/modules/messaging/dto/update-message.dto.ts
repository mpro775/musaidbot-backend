import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'النص الجديد للرسالة',
    example: 'تم التحديث!',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description: 'تعديل القناة إن لزم',
    example: 'telegram',
    enum: ['whatsapp', 'telegram'],
    required: false,
  })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiProperty({
    description: 'بيانات إضافية أو تحديث الميتاداتا',
    type: Object,
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
