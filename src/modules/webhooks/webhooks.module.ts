// src/modules/webhooks/webhooks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WhatsappService } from '../whatsapp/whatsapp.service';

// استيراد السكيما الخاصة بالـ Response
import { Response, ResponseSchema } from '../responses/schemas/response.schema';
// استيراد السكيما الخاصة بالـ Merchant
import { Merchant, MerchantSchema } from '../merchants/schemas/merchant.schema';
// إضافة Webhook نفسه إذا تحتاجه
import { Webhook, WebhookSchema } from './schemas/webhook.schema';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      // هنا نعرّف موديلات الـ Mongoose التي نحتاجها
      { name: Response.name, schema: ResponseSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: Webhook.name, schema: WebhookSchema },
    ]),
    ConversationsModule, // للتأكد من توفر ConversationsService
  ],
  providers: [WebhooksService, WhatsappService],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}
