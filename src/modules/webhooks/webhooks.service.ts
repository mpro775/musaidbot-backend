// src/modules/webhooks/webhooks.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema';
import { MessageService } from '../messaging/message.service';
import { MerchantsService } from '../merchants/merchants.service';
import { ProductsService } from '../products/products.service';
import { PromptBuilderService } from '../prompt/prompt-builder.service';
import { LlmProxyService } from '../llm/llm-proxy.service';
import { TelegramService } from '../telegram/telegram.service'; // تأكد من إضافة خدمة تيليجرام!

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
    private readonly telegramService: TelegramService, // Inject TelegramService هنا
  ) {}

  async handleMessage(channel: string, merchantId: string, body: any) {
    // جلب بيانات التاجر (من قاعدة البيانات)
    const merchant = await this.merchantsService.findOne(merchantId);
    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    try {
      // استخراج chatId للعميل من تيليجرام
      const chatId = body.message?.chat?.id?.toString();
      const text = body.message?.text || '';

      // جلب المنتجات لهذا التاجر
      const products = await this.productsService.findAllByMerchant(
        new Types.ObjectId(merchantId),
      );

      // بناء البرومبت
      const prompt = this.promptBuilder.buildPrompt({
        merchant,
        products,
        message: text,
        // chatHistory: [...], // لو تريد إضافتها مستقبلاً
      });

      // استدعاء الذكاء الاصطناعي
      const aiResponse = await this.llmProxyService.sendPrompt(prompt, {
        model: 'gemini-1.5-flash-latest',
        temperature: 0.4,
        maxTokens: 1024,
      });

      // حفظ سجل المحادثة (العميل + الذكاء الاصطناعي)
      await this.messageService.createOrAppend({
        merchantId,
        sessionId: chatId, // اجعل sessionId هو chatId العميل
        channel,
        messages: [
          {
            role: 'customer',
            text,
            timestamp: new Date(),
            metadata: body.metadata || {},
          },
          {
            role: 'ai',
            text: aiResponse,
            timestamp: new Date(),
            metadata: { prompt },
          },
        ],
      });

      // طباعة لمراجعة البرومبت والبيانات
      console.log('PROMPT ====>\n', prompt);
      console.log(`Received from ${channel} for merchant ${merchantId}:`, body);

      // إرسال الرد للعميل نفسه على تيليجرام
      if (channel === 'telegram' && chatId) {
        await this.telegramService.sendMessage(
          merchant.channelConfig?.telegram?.token,
          chatId,
          aiResponse,
        );
      }

      return { status: 'ok', merchant, products, aiResponse };
    } catch (error) {
      console.error('Webhook Error: ', error);
      throw new InternalServerErrorException(error.message || error);
    }
  }
}
