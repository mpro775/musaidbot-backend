// src/modules/responses/dto/create-response.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsUrl } from 'class-validator';

export class CreateResponseDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @IsUrl()
  originalUrl: string;
  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  replyText: string;
}
