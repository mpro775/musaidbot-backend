// src/modules/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'البريد الإلكتروني للمستخدم',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'اسم المستخدم', example: 'Ahmed Alsaeed' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'الدور الخاص بالمستخدم',
    example: 'ADMIN',
    enum: ['ADMIN', 'MERCHANT'],
  })
  @IsOptional()
  @IsString()
  role?: string; // مثلاً ADMIN أو MERCHANT
}
