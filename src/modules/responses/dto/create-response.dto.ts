// src/modules/responses/dto/create-response.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateResponseDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @IsString()
  @IsNotEmpty()
  replyText: string;
}
