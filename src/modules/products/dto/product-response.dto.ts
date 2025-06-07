// src/modules/products/dto/product-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'المعرف الفريد للمنتج' })
  _id: string;

  @ApiProperty({ description: 'معرف التاجر مالك المنتج' })
  merchantId: string;

  @ApiProperty({ description: 'الرابط الأصلي للمنتج' })
  originalUrl: string;

  @ApiProperty({ description: 'اسم المنتج', example: '' })
  name: string;

  @ApiProperty({ description: 'السعر', example: 0 })
  price: number;

  @ApiProperty({ description: 'هل المنتج متوفر؟', example: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'كلمات مفتاحية', type: [String] })
  keywords: string[];
}
