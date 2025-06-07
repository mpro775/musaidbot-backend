import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEmail,
} from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  userId: string; // إذا كنت ستربطه بمستخدم

  @IsString()
  whatsappNumber: string;
  @IsString()
  @IsOptional()
  address?: string;
}
