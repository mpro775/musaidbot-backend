import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromptConfigDto } from './prompt-config.dto';

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

  @IsString()
  @IsNotEmpty()
  whatsappNumber: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  // هنا نستخدم ValidateNested + Type لتحويل الجسم إلى PromptConfigDto
  @ValidateNested()
  @Type(() => PromptConfigDto)
  @IsOptional()
  promptConfig?: PromptConfigDto;
}
