import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksService } from './webhooks.service';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
  ],
  providers: [WebhooksService, WhatsappService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
