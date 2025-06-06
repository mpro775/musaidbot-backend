import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number; // بالدولار، مثلاً

  @IsNumber()
  @IsNotEmpty()
  duration: number; // مدة الاشتراك بالأيام
}
