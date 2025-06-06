// src/modules/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  role?: string; // مثلا ADMIN أو MERCHANT
}
