import { IsString, IsOptional } from 'class-validator';

export class PromptConfigDto {
  @IsString()
  @IsOptional()
  dialect?: string;

  @IsString()
  @IsOptional()
  tone?: string;

  @IsString()
  @IsOptional()
  template?: string;
}
