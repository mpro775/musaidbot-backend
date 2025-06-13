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
    const modelName = options?.model || 'gemini-1.5-flash-latest';
    if (!apiKey) throw new Error('No Gemini API key provided');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // الإرسال الأولي: system + user
    const initial = await model.generateContent({
      contents: [
        { role: 'system', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: userQuestion }] },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 512,
      },
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

    const text0 =
      initial.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    this.logger.log(`Initial LLM output: ${text0.slice(0, 80)}...`);

    // محاولة parse JSON لاستدعاء search_products أو search_offers
    let func: 'search_products' | 'search_offers' | null = null;
    let query: string | null = null;
    try {
      const obj = JSON.parse(text0);
      if (
        obj.function === 'search_products' ||
        obj.function === 'search_offers'
      ) {
        func = obj.function;
        query = obj.arguments?.query;
      }
    } catch (e) {
      // نتجاهل خطأ التحويل: إذا لم يكن النص JSON صالحاً فالـ LLM لم يطلب دالة
      this.logger.debug('Not a JSON function call:', e.message);
    }
    if (!func || !query) {
      return text0; // لا وظيفة → رد عادي
    }

    // تنفيذ البحث المناسب
    let items: any[];
    if (func === 'search_products') {
      items = await this.productsService.searchProducts(merchantId, query);
    } else {
      items = await this.offersService.searchOffers(merchantId, query);
    }
    this.logger.log(
      `Function ${func}("${query}") returned ${items.length} items`,
    );

    // تلخيص الحقول المرسلة للـ LLM
    const summary = items.map((p) => ({
      name: p.name,
      price: p.price,
      isAvailable: p.isAvailable,
      url: p.originalUrl,
    }));

    // الإرسال الثاني: system + user + function result
    const followUp = await model.generateContent({
      contents: [
        { role: 'system', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: userQuestion }] },
        { role: 'assistant', parts: [{ text: JSON.stringify(summary) }] },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
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

    return followUp.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}
