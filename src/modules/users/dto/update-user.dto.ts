// src/modules/users/dto/update-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'البريد الإلكتروني الجديد',
    example: 'newemail@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'الاسم الجديد للمستخدم',
    example: 'Saleh Saeed',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ description: 'الدور الجديد', example: 'MERCHANT' })
  @IsOptional()
  @IsString()
  role?: string;
}
