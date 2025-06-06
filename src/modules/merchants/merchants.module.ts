import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Merchant, MerchantSchema } from './schemas/merchant.schema';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
    ]),
  ],
  providers: [MerchantsService],
  controllers: [MerchantsController],
  exports: [MerchantsService], // إذا احتاج أي Module آخر خدمة التجار
})
export class MerchantsModule {}
