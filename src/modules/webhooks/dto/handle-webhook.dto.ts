import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class HandleWebhookDto {
  @IsString()
  @IsNotEmpty()
  eventType: string; // مثلاً 'product.updated'

  @IsObject()
  @IsOptional()
  payload?: any; // محتوى الحدث (يمكن نص دائناميك)
}
