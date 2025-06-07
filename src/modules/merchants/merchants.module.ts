import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Merchant, MerchantSchema } from './schemas/merchant.schema';
import { MerchantsService } from './merchants.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
    ]),
    TemplatesModule,
    WhatsappModule,
  ],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
