// src/modules/llm/llm.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ProductsModule } from '../products/products.module'; // ✅ تأكد من الاستيراد الصحيح
import { OffersModule } from '../offers/offers.module'; // حسب اعتمادك الثاني
import { LlmProxyService } from './llm-proxy.service';

@Module({
  imports: [
    forwardRef(() => ProductsModule), // ✅ استخدم forwardRef لو فيه دورة
    OffersModule,
  ],
  providers: [LlmProxyService],
  exports: [LlmProxyService],
})
export class LlmModule {}
