// src/modules/auth/dto/register.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  // حقل جديد: اسم المتجر (Store Name)
  @IsString()
  @IsNotEmpty()
  storeName: string;

  // حقل جديد: رقم واتساب (اختياريًّا)
  @IsOptional()
  @IsString()
  whatsappNumber?: string;
}
