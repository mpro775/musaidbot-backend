// src/modules/llm/llm-proxy.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { ProductsService } from '../products/products.service';
import { OffersService } from '../offers/offers.service';

@Injectable()
export class LlmProxyService {
  private readonly logger = new Logger(LlmProxyService.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly offersService: OffersService,
  ) {}

  private extractJsonFunctionCall(
    text: string,
  ): { func: string; query: string } | null {
    const match = text.match(/(\{[^}]*"function"\s*:\s*"[^"]+"[^}]*\})/s);
    if (!match) return null;
    try {
      const obj = JSON.parse(match[1]);
      if (typeof obj.function === 'string' && obj.arguments?.query) {
        return { func: obj.function, query: obj.arguments.query };
      }
    } catch (err) {
      console.warn('Parsing function call failed:', err?.message || err);
    }
    return null;
  }

  async askWithSearch(
    systemPrompt: string,
    userQuestion: string,
    merchantId: string,
    options?: {
      model?: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    const modelName = options?.model || 'gemini-2.0-flash';
    if (!apiKey) throw new Error('No Gemini API key provided');

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: modelName,
    });

    const temperature = options?.temperature ?? 0.4;
    const maxTokens = options?.maxTokens ?? 1024;

    // ✅ 0) تدخل يدوي للكلمات العامة (قبل LLM)
    const isGeneric = /كايب?ل(ات)?|سماعة|شاحن|وصلة|سلك|كيبل|كابل|كبل/i.test(
      userQuestion,
    );

    if (isGeneric) {
      const cleanedQuery = userQuestion
        .replace(
          /^(هل)?\s*(عندك|عندكم|فيه|يتوفر|أحتاج|أبي|ابغى|ممكن|وش|شو|ايش|لو سمحت)?\s*/gi,
          '',
        )
        .replace(/[؟?]/g, '')
        .trim();
      const results = await this.productsService.searchProducts(
        merchantId,
        cleanedQuery,
      );
      this.logger.log(`[🔍 CLEANED QUERY]: "${cleanedQuery}"`);

      // ✅ إذا ما في نتائج، استخدم fallback products واطلب من LLM التقييم
      if (results.length === 0) {
        this.logger.warn(
          `[llm] No direct matches for "${cleanedQuery}", using fallback products...`,
        );

        const fallback = await this.productsService.getFallbackProducts(
          merchantId,
          20,
        );

        if (fallback.length > 0) {
          const fallbackSummary = fallback.map((p) => ({
            name: p.name,
            price: p.price,
            isAvailable: p.isAvailable,
            url: p.originalUrl,
          }));

          const prompt = `${systemPrompt}

## سؤال العميل:
${userQuestion}

## المنتجات المتوفرة حاليًا:
${fallbackSummary
  .map(
    (item) =>
      `- ${item.name} — ${item.price} ريال — ${item.isAvailable ? '✅ متوفر' : '❌ غير متوفر'}${item.url ? ` — [رابط المنتج](${item.url})` : ''}`,
  )
  .join('\n')}

## تعليمات المساعد:
- هذه قائمة كاملة من المنتجات المتاحة حاليًا في المتجر.
- إذا وجدت منتجًا يبدو أنه المقصود من العميل، قدمه له بثقة.
- إذا لم تجد أي شيء مناسب، اعتذر بلطف واطلب توضيح أكثر.
`;

          const fallbackResponse = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature, maxOutputTokens: maxTokens },
          });

          const fallbackAnswer =
            fallbackResponse.response?.candidates?.[0]?.content?.parts?.[0]
              ?.text ?? '';
          return fallbackAnswer.trim();
        }
      }
      if (results.length > 0) {
        const summary = results.map((p) => ({
          name: p.name,
          price: p.price,
          isAvailable: p.isAvailable,
          url: p.originalUrl,
        }));

        const prompt = `${systemPrompt}

## سؤال العميل:
${userQuestion}

## نتائج البحث من النظام:
${summary
  .map(
    (item) =>
      `- **${item.name}**: سعره ${item.price} ريال — ${item.isAvailable ? '✅ متوفر' : '❌ غير متوفر'} — [رابط الشراء](${item.url})`,
  )
  .join('\n')}
## تعليمات حتمية للمساعد:
- تم تنفيذ البحث فعليًا عبر نظام المنتجات.
- لا تطلب من العميل أي توضيح إضافي.
- لا ترفض الإجابة على السؤال بحجة أنه عام أو غير دقيق.
- لا تستخدم كلمات مثل "مصطلح عام" أو "يرجى تحديد".
- استخدم فقط النتائج أعلاه وقدمها بأسلوب ودود باللهجة الخليجية.
- مثال على بداية الرد:
  "هلا وغلا! هذه أفضل الخيارات المتوفرة عندنا:"
`;
        this.logger.log(`🔍 Received question: "${userQuestion}"`);
        this.logger.log(`🧠 Detected generic term? ${isGeneric}`);
        const followUp = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
          ],
        });
        console.log('✅ Summary passed to LLM:', summary);

        const answer =
          followUp.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        this.logger.log(
          `Manual generic query detected. Responded with search result.`,
        );
        return answer.trim();
      }
    }

    // ✅ 1) المكالمة الأولى بدون تدخل
    const combined = `${systemPrompt}\n\n${userQuestion}`;
    const initial = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: combined }] }],
      generationConfig: { temperature, maxOutputTokens: 512 },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const firstText =
      initial.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    this.logger.log(`Initial output snippet: ${firstText.slice(0, 80)}`);

    // ✅ 2) تحليل دالة وظيفية إن وجدت
    const call = this.extractJsonFunctionCall(firstText);
    if (!call) return firstText.trim();

    const { func, query } = call;
    this.logger.log(`Detected function call: ${func}("${query}")`);

    const items =
      func === 'search_products'
        ? await this.productsService.searchProducts(merchantId, query)
        : await this.offersService.searchOffers(merchantId, query);

    this.logger.log(`Function ${func} returned ${items.length} items`);

    const summary = items.map((p) => ({
      name: p.name,
      price: p.price,
      isAvailable: p.isAvailable,
      url: p.originalUrl,
    }));

    const followUpPrompt = `${systemPrompt}\n\n${userQuestion}\n\n${JSON.stringify(summary)}`;
    const followUp = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: followUpPrompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });
    console.log('📤 Final Prompt to Gemini:', prompt);

    const finalText =
      followUp.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return finalText.trim();
  }
}
