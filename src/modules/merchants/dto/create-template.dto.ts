// src/modules/merchants/dto/create-template.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string; // معرف القالب

  @IsString()
  @IsNotEmpty()
  body: string; // نص القالب مع {{1}}, {{2}}…
}
