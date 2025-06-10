// src/modules/auth/dto/onboarding.dto.ts
import { IsString, IsOptional, IsUrl, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardingDto {
  @IsString()
  @ApiProperty({ description: 'اسم المتجر', example: 'متجر مفيد' })
  name: string; // بدل storeName

  @IsOptional()
  @IsUrl()
  @ApiProperty({
    description: 'رابط الشعار (URL)',
    example: 'https://…/logo.png',
    required: false,
  })
  logoUrl?: string;

  @Matches(/^\+?\d{7,15}$/)
  @ApiProperty({ description: 'رقم الهاتف', example: '+970599123456' })
  phone: string;

  @IsOptional()
  @Matches(/^\+?\d{7,15}$/)
  @ApiProperty({
    description: 'واتساب (اختياري)',
    example: '+970599123456',
    required: false,
  })
  whatsappNumber?: string;
}
