// src/modules/webhooks/webhooks.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema';
import { ConversationsService } from '../conversations/conversations.service';
import { MessageService } from '../messaging/message.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messageService: MessageService,
    @InjectModel(Webhook.name)
    private readonly webhookModel: Model<WebhookDocument>,
  ) {}

  async handleEvent(eventType: string, payload: any) {
    const { merchantId, from, messageText, metadata } = payload;
    if (!merchantId || !from || !messageText) {
      throw new BadRequestException(`Invalid payload for ${eventType}`);
    }

    // 1. تخزين الحدث الخام
    await this.webhookModel.create({
      eventType,
      payload: JSON.stringify(payload),
      receivedAt: new Date(),
    });

    // 2. ضمان وجود المحادثة أو إنشاؤها
    const convoDoc = await this.conversationsService.ensureConversation(
      merchantId,
      from,
    );
    const conversationId = convoDoc._id.toString();

    // 3. حفظ رسالة العميل
    await this.messageService.create({
      merchantId,
      conversationId,
      channel: eventType.replace('_incoming', ''), // مثلاً 'whatsapp'
      role: 'customer',
      text: messageText,
      metadata: metadata || {},
    });

    // 4. نعيد conversationId فقط لبقية خطوات الـ workflow في n8n
    return { conversationId };
  }
}
