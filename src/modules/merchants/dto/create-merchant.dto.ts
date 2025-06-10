import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEmail,
  ValidateNested,
  IsObject,
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

  @IsOptional()
  @IsString()
  apiToken: string;

  @IsOptional()
  @IsObject()
  channelConfig: {
    telegram?: {
      chatId?: string;
      botToken?: string;
    };
    whatsapp?: {
      phone?: string;
    };
  };
  @IsString()
  @IsNotEmpty()
  userId: string;

  // هنا نستخدم ValidateNested + Type لتحويل الجسم إلى PromptConfigDto
  @ValidateNested()
  @Type(() => PromptConfigDto)
  @IsOptional()
  promptConfig?: PromptConfigDto;

  @IsOptional()
  @IsString()
  businessType: string;

  @IsOptional()
  @IsString()
  businessDescription: string;

  @IsOptional()
  @IsString()
  preferredDialect: string;
}
