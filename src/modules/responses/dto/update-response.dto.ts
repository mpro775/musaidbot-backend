// src/modules/responses/dto/update-response.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateResponseDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  replyText?: string;
}
