// src/modules/webhooks/webhooks.service.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema'; // تأكد من وجود هذا المسار
import { BadRequestException, Injectable } from '@nestjs/common';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly whatsappService: WhatsappService,
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
  ) {}

  async handleEvent(eventType: string, payload: any) {
    if (eventType === 'whatsapp_incoming') {
      const { merchantId, from, messageText } = payload;
      if (!merchantId || !from || !messageText) {
        throw new BadRequestException('Invalid payload for whatsapp_incoming');
      }

      // ✅ تخزين الحدث في قاعدة البيانات
      await this.webhookModel.create({
        eventType,
        payload: JSON.stringify(payload),
        receivedAt: new Date(),
      });

      const replyText = await this.whatsappService.handleIncoming(
        merchantId,
        from,
        messageText,
      );
      return { replyText };
    }

    return { message: 'Event type not supported' };
  }
}
