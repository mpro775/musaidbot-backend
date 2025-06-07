// src/modules/whatsapp/whatsapp.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Response as AutoResponse,
  ResponseDocument,
} from '../responses/schemas/response.schema';
import { ConversationsService } from '../conversations/conversations.service';
import {
  Merchant,
  MerchantDocument,
} from '../merchants/schemas/merchant.schema';
import axios from 'axios';

export interface WhatsAppSendResponse {
  messageId: string;
}
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectModel(AutoResponse.name)
    private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
    private readonly conversationService: ConversationsService,
  ) {}

  /**
   * تبحث عن النص المناسب للرد بناءً على الكلمة المفتاحية
   */
  async findReplyText(
    merchantId: string,
    messageText: string,
  ): Promise<string | null> {
    const responses = await this.responseModel.find({
      merchantId: new Types.ObjectId(merchantId),
    });
    const matched = responses.find((r) =>
      messageText.toLowerCase().includes(r.keyword.toLowerCase()),
    );
    return matched ? matched.replyText : null;
  }

  /**
   * ترسل الرد إلى واجهة WhatsApp Cloud API
   */
  async sendReplyToWhatsApp(to: string, replyText: string) {
    try {
      const token = process.env.WHATSAPP_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_ID;
      const url = `https://graph.facebook.com/v15.0/${phoneId}/messages`;

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to,
          text: { body: replyText },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp message: ${err.message}`);
    }
  }

  /**
   * مسار رئيسي للردّ على رسالة واردة من WhatsApp
   */
  async handleIncoming(
    merchantId: string,
    from: string,
    messageText: string,
  ): Promise<string | null> {
    // 1. إيجاد الرد الآلي
    const replyText = await this.findReplyText(merchantId, messageText);

    // 2. إرسال الردّ إلى رقم العميل عبر WhatsApp Cloud API
    if (replyText) {
      await this.sendReplyToWhatsApp(from, replyText);
    }

    // 3. التحقق من وجود محادثة أو إنشاؤها
    const convo = await this.conversationService.ensureConversation(
      merchantId,
      from,
    );
    const convoId = (convo._id as Types.ObjectId).toString();

    await this.conversationService.addMessage(convoId, {
      sender: 'customer',
      text: messageText,
      timestamp: new Date(),
    });

    // 5. تسجيل رسالة البوت إذا وُجد رد
    if (replyText) {
      await this.conversationService.addMessage(convoId, {
        sender: 'bot',
        text: replyText,
        timestamp: new Date(),
      });
    }

    return replyText;
  }
  async send(
    config: { token: string; number: string },
    to: string,
    text: string,
  ): Promise<WhatsAppSendResponse> {
    const response = await axios.post(
      `https://graph.facebook.com/v15.0/${config.number}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: text },
      },
      {
        headers: { Authorization: `Bearer ${config.token}` },
      },
    );

    // Mongoose response.data.messages is مصفوفة، نأخذ العنصر الأول
    const messageId = response.data?.messages?.[0]?.id;
    if (!messageId) {
      throw new Error(
        'Failed to retrieve messageId from WhatsApp API response',
      );
    }

    return { messageId };
  }
}
