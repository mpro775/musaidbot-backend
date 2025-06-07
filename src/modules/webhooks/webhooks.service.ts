// src/modules/webhooks/webhooks.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly whatsappService: WhatsappService) {}

  async handleEvent(eventType: string, payload: any) {
    if (eventType === 'whatsapp_incoming') {
      const { merchantId, from, messageText } = payload;
      if (!merchantId || !from || !messageText) {
        throw new BadRequestException('Invalid payload for whatsapp_incoming');
      }

      const replyText = await this.whatsappService.handleIncoming(
        merchantId,
        from,
        messageText,
      );
      return { replyText };
    }

    // إن وُجدت أحداث أخرى لاحقًا
    return { message: 'Event type not supported' };
  }
}
