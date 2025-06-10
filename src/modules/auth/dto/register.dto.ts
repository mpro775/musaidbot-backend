// src/modules/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'البريد الإلكتروني',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'كلمة المرور (6 أحرف فأكثر)',
    example: 'securePass',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'اسم المستخدم أو التاجر', example: 'أحمد' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'رقم الجوال', example: '9665XXXXXXX' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'اسم المتجر الخاص بالتاجر',
    example: 'عطور الفخامة',
  })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({
    description: 'رقم واتساب للردود (اختياري)',
    example: '9665XXXXXXX',
    required: false,
  })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;
}
