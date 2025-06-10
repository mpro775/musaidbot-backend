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
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'اسم المتجر', example: 'متجر عطور النخبة' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'البريد الإلكتروني للتاجر',
    example: 'store@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'رقم جوال التاجر', example: '9665XXXXXXX' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'رقم واتساب الرسمي للردود',
    example: '9665XXXXXXX',
  })
  whatsappNumber: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: 'رابط شعار المتجر (اختياري)',
    example: 'https://cdn.com/logo.png',
    required: false,
  })
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'عنوان المتجر (اختياري)',
    example: 'الرياض - المملكة العربية السعودية',
    required: false,
  })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Token خاص بالتاجر للربط الآمن',
    example: 'sk-xxxxx',
    required: false,
  })
  apiToken: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'إعدادات القنوات (واتساب، تيليجرام)',
    example: {
      whatsapp: { phone: '9665XXXXXXX' },
      telegram: { chatId: '123456789', botToken: 'bot:ABCDEF' },
    },
    required: false,
  })
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
  @ApiProperty({
    description: 'معرّف المستخدم المرتبط بالتاجر',
    example: '6623abcd1234ef5678',
  })
  userId: string;

  // هنا نستخدم ValidateNested + Type لتحويل الجسم إلى PromptConfigDto
  @ValidateNested()
  @Type(() => PromptConfigDto)
  @IsOptional()
  @ApiProperty({
    description: 'تكوين الردود (نغمة، لهجة، قالب مخصص)',
    required: false,
    type: () => PromptConfigDto,
  })
  promptConfig?: PromptConfigDto;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'نوع النشاط التجاري',
    example: 'منتجات تجميل طبيعية',
    required: false,
  })
  businessType: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'وصف قصير للمتجر أو USP',
    example: 'نقدم منتجات عضوية 100% بتغليف فاخر',
    required: false,
  })
  businessDescription: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'اللهجة المفضلة للردود',
    example: 'gulf',
    required: false,
  })
  preferredDialect: string;
}
