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
    const chatId = body.message?.chat?.id?.toString();
    const userText = (body.message?.text || '').trim();

    if (!chatId) throw new BadRequestException('chatId is missing');
    const merchant = await this.merchantsService.findOne(merchantId);
    if (!merchant) throw new BadRequestException('Merchant not found');
    const token = merchant.channelConfig?.telegram?.token;
    if (!token) throw new BadRequestException('Telegram token is not set');
    try {
      // 1) ترحيب أو noise
      if (/^(هلا|السلام|السلام عليكم|مرحب|هاي|مم+|🙂+|👍+)$/i.test(userText)) {
        const reply = `ياهلا وسهلا! أنا مساعد ${merchant.name}، كيف أقدر أخدمك اليوم؟ 🛍️`;
        await this.sendAndLogMessage(
          merchant,
          channel,
          chatId,
          userText,
          reply,
        );
        return { status: 'ok', aiResponse: reply };
      }

      // 2) هل لديكم منتج معين؟ (صيغة صريحة)
      const matchExplicit = userText.match(/هل\s+لديكم?\s+(.+)\??$/i);
      if (matchExplicit) {
        const query = matchExplicit[1];
        return await this.respondToProductQuery(
          merchant,
          channel,
          chatId,
          userText,
          query,
        );
      }

      // 3) استفسار مباشر عن منتج بصيغة "أبغى/عندكم/أبي"
      if (/^(أبغى|أبي|عندكم)\s+.+/i.test(userText)) {
        const query = userText.replace(/^(أبغى|أبي|عندكم)/i, '').trim();
        return await this.respondToProductQuery(
          merchant,
          channel,
          chatId,
          userText,
          query,
        );
      }

      // 4) "نعم" كرد على تذكير منتج
      if (/^نعم$/i.test(userText)) {
        const session = await this.messageService.findBySession(chatId);
        const pending = session?.messages
          ?.reverse()
          .find((m) => m.text?.startsWith('PENDING_REMINDER:'));
        if (pending) {
          const productId = pending.text.split(':')[1];
          await this.remindersService.subscribe(
            merchantId,
            chatId,
            channel,
            productId,
          );
          const reply = `تم تسجيل تنبيه توفر المنتج. بنعلمك أول ما يتوفر بإذن الله 😊`;
          await this.telegramService.sendMessage(token, chatId, reply);
          return { status: 'subscribed', aiResponse: reply };
        }
      }

      // 5) Fallback إلى LLM مع السياق
      const session = await this.messageService.findBySession(chatId);
      const chatHistory =
        session?.messages?.map((m) => ({
          role: m.role as 'customer' | 'ai',
          text: m.text,
        })) || [];

      const systemPrompt = this.promptBuilder.buildPrompt({
        merchant,
        message: userText,
        chatHistory,
      });

      const aiResponse = await this.llmProxyService.askWithSearch(
        systemPrompt,
        userText,
        merchantId,
        { model: 'gemini-1.5-flash-latest', temperature: 0.4, maxTokens: 1024 },
      );

      // 6) تحليل الرد للتذكير بالمنتج الغير متوفر
      if (
        /ما\s+لقينا|ما\s+وجدنا|غير\s+متوفر/i.test(aiResponse) &&
        userText.length >= 3
      ) {
        const match = await this.productsService.findByName(
          merchantId,
          userText,
        );
        if (match) {
          const msg = `المنتج "${match.name}" غير متوفر حالياً. تبغى نسجلك تنبيه وقت يتوفر؟ (أرسل "نعم")`;
          await this.messageService.createOrAppend({
            merchantId,
            sessionId: chatId,
            channel,
            messages: [
              {
                role: 'ai',
                text: `PENDING_REMINDER:${match.id}`,
                timestamp: new Date(),
              },
            ],
          });
          await this.telegramService.sendMessage(token, chatId, msg);
          return { status: 'pending_reminder' };
        }
      }

      // 7) إرسال الرد وتسجيل المحادثة
      await this.sendAndLogMessage(
        merchant,
        channel,
        chatId,
        userText,
        aiResponse,
        systemPrompt,
      );
      return { status: 'ok', aiResponse };
    } catch (error) {
      console.error('Webhook Error:', error);
      throw new InternalServerErrorException(
        error.message || 'Internal error in handleMessage',
      );
    }
  }
  private async respondToProductQuery(
    merchant: any,
    channel: string,
    chatId: string,
    userText: string,
    query: string,
  ) {
    const items = await this.productsService.searchProducts(
      merchant._id,
      query,
    );
    let reply: string;

    if (items.length > 0) {
      const lines = items
        .slice(0, 5)
        .map(
          (p) =>
            `• ${p.name} — ${p.price} ريال — ${p.isAvailable ? '✅ متوفر' : '❌ غير متوفر'}`,
        );
      reply = `نتائج البحث لـ "${query}":\n${lines.join('\n')}`;
      if (items.length > 5) {
        reply += `\nو${items.length - 5} نتيجة أخرى...`;
      }

      await this.sendAndLogMessage(merchant, channel, chatId, userText, reply);
      return { status: 'ok', aiResponse: reply };
    }

    // ⬇️ لم نجد المنتج → استدعِ LLM لإكمال الرد الذكي
    const session = await this.messageService.findBySession(chatId);
    const chatHistory =
      session?.messages?.map((m) => ({
        role: m.role as 'customer' | 'ai',
        text: m.text,
      })) || [];

    const systemPrompt = this.promptBuilder.buildPrompt({
      merchant,
      message: userText,
      chatHistory,
    });

    const aiResponse = await this.llmProxyService.askWithSearch(
      systemPrompt,
      userText,
      merchant._id,
      { model: 'gemini-1.5-flash-latest', temperature: 0.4, maxTokens: 1024 },
    );

    // ⬇️ تحليل إذا كان الرد يحتوي "غير متوفر" → أضف عرض التذكير
    if (/غير متوفر/i.test(aiResponse)) {
      const match = await this.productsService.findByName(merchant._id, query);
      if (match) {
        const msg = `المنتج "${match.name}" غير متوفر حالياً. تبغى نسجلك تنبيه وقت يتوفر؟ (أرسل "نعم")`;
        await this.messageService.createOrAppend({
          merchantId: merchant._id,
          sessionId: chatId,
          channel,
          messages: [
            {
              role: 'ai',
              text: `PENDING_REMINDER:${match.id}`,
              timestamp: new Date(),
            },
          ],
        });
        await this.telegramService.sendMessage(
          merchant.channelConfig.telegram.token,
          chatId,
          msg,
        );
        return { status: 'pending_reminder' };
      }
    }

    // 🧠 رد افتراضي في حال لم نجد أي مطابقة ولا رد ذكي واضح
    await this.sendAndLogMessage(
      merchant,
      channel,
      chatId,
      userText,
      aiResponse,
      systemPrompt,
    );
    return { status: 'ok', aiResponse };
  }

  private async sendAndLogMessage(
    merchant: any,
    channel: string,
    chatId: string,
    userText: string,
    aiReply: string,
    systemPrompt?: string,
  ) {
    await this.messageService.createOrAppend({
      merchantId: merchant._id,
      sessionId: chatId,
      channel,
      messages: [
        { role: 'customer', text: userText, timestamp: new Date() },
        {
          role: 'ai',
          text: aiReply,
          timestamp: new Date(),
          metadata: { systemPrompt },
        },
      ],
    });

    if (channel === 'telegram') {
      const token = merchant.channelConfig?.telegram?.token;
      if (!token) throw new BadRequestException('Telegram token not set');
      await this.telegramService.sendMessage(token, chatId, aiReply);
    }
  }
}
