// src/modules/webhooks/webhooks.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema';
import { MessageService } from '../messaging/message.service';
import { MerchantsService } from '../merchants/merchants.service';
import { ProductsService } from '../products/products.service';
import { PromptBuilderService } from '../prompt/prompt-builder.service';
import { LlmProxyService } from '../llm/llm-proxy.service';
import { TelegramService } from '../telegram/telegram.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly messageService: MessageService,
    @InjectModel(Webhook.name)
    private readonly webhookModel: Model<WebhookDocument>,
    private readonly merchantsService: MerchantsService,
    private readonly productsService: ProductsService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly llmProxyService: LlmProxyService,
    private readonly telegramService: TelegramService,
    private readonly remindersService: RemindersService,
  ) {}

  async handleMessage(channel: string, merchantId: string, body: any) {
    const merchant = await this.merchantsService.findOne(merchantId);
    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    try {
      const chatId = body.message?.chat?.id?.toString();
      const userText = body.message?.text || '';
      if (!chatId) {
        throw new BadRequestException('chatId is missing in payload');
      }

      // 1️⃣ بناء الـ system prompt بدون جلب كل المنتجات
      const systemPrompt = this.promptBuilder.buildPrompt({
        merchant,
        message: '', // المستخدم سيُرسل كسؤال لاحق
        chatHistory: [], // يمكن ملؤها لو احتجت لاحقاً
      });

      // 2️⃣ اسأل مع دعم البحث عن المنتجات عند الحاجة
      const aiResponse = await this.llmProxyService.askWithSearch(
        systemPrompt,
        userText,
        merchantId,
        { model: 'gemini-1.5-flash-latest', temperature: 0.4, maxTokens: 1024 },
      );
      const unavailableMatch = /غير متوفر/i.test(aiResponse);
      if (unavailableMatch) {
        // احفظ المنتج المقصود في الـ session (مثلاً باستخدام MessageService metadata)
        const missingProduct = await this.productsService.findByName(
          merchantId,
          userText,
        );
        if (missingProduct) {
          // اطلب تأكيد التنبيه
          const token = merchant.channelConfig?.telegram?.token;
          if (!token) throw new Error('Telegram token is missing!');

          await this.telegramService.sendMessage(
            token,
            chatId,
            `المنتج "${missingProduct.name}" غير متوفر حالياً. هل ترغب بإشعارك عند توفره؟ (أرسل "نعم" أو "لا")`,
          );

          // خزّن في الجلسة ID المنتج المنتظر
          await this.messageService.createOrAppend({
            merchantId,
            sessionId: chatId,
            channel,
            messages: [
              {
                role: 'bot',
                text: `PENDING_REMINDER:${missingProduct.id}`,
              },
            ],
          });
        }
        return { status: 'pending_reminder' };
      }
      if (userText.trim() === 'نعم') {
        // ابحث في history عن الرسالة التي خزنت PENDING_REMINDER
        const session = await this.messageService.findBySession(chatId);
        const pending = session?.messages.find((m) =>
          m.text.startsWith('PENDING_REMINDER:'),
        );
        if (pending) {
          const productId = pending.text.split(':')[1];
          await this.remindersService.subscribe(
            merchantId,
            chatId,
            channel,
            productId,
          );
          const token = merchant.channelConfig?.telegram?.token;
          if (!token) throw new Error('Telegram token is missing!');
          await this.telegramService.sendMessage(
            token,
            chatId,
            `تم تسجيل تنبيه توفر المنتج.`,
          );
          return { status: 'subscribed' };
        }
      }
      // 3️⃣ حفظ سجل المحادثة (العميل + الذكاء الاصطناعي)
      await this.messageService.createOrAppend({
        merchantId,
        sessionId: chatId,
        channel,
        messages: [
          {
            role: 'customer',
            text: userText,
            timestamp: new Date(),
            metadata: body.metadata || {},
          },
          {
            role: 'ai',
            text: aiResponse,
            timestamp: new Date(),
            metadata: { systemPrompt },
          },
        ],
      });

      // 4️⃣ إرسال الرد للعميل على تيليجرام
      if (channel === 'telegram') {
        const token = merchant.channelConfig?.telegram?.token;
        if (!token) throw new Error('Telegram token is missing!');
        await this.telegramService.sendMessage(token, chatId, aiResponse);
      }

      return { status: 'ok', aiResponse };
    } catch (error) {
      console.error('Webhook Error:', error);
      throw new InternalServerErrorException(error.message || error);
    }
  }
}
