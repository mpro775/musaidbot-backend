import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class PromptConfigDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'اللهجة (مثل: فصحى، خليجية، مصرية)',
    example: 'gulf',
    required: false,
  })
  dialect?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'نغمة الرد (مثل: ودّي، احترافي، ساخر)',
    example: 'ودّي',
    required: false,
  })
  tone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'قالب مخصص لتوجيه البوت (اختياري)',
    example: 'ابدأ كل رد بـ: "هلا وغلا!"',
    required: false,
  })
  template?: string;
}
