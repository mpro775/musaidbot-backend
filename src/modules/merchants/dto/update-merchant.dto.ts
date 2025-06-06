import { IsString, IsOptional, IsUrl, IsEmail } from 'class-validator';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
