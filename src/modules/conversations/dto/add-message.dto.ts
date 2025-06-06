import { IsString, IsNotEmpty } from 'class-validator';

export class AddMessageDto {
  @IsString()
  @IsNotEmpty()
  sender: string; // 'merchant' | 'user'

  @IsString()
  @IsNotEmpty()
  text: string;
}
