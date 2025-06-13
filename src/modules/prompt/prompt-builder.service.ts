// src/modules/prompt/prompt-builder.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilderService {
  /**
   * يبني البرومبت الكامل باستخدام:
   * - merchant.finalPromptTemplate (يحتوي السياسات وتعليمات المنتجات/العروض)
   * - سجل المحادثة (اختياري)
   * - سؤال العميل
   * - تعليمات استدعاء الأدوات (Tool Calling)
   */
  buildPrompt(params: {
    merchant: any;
    message: string;
    chatHistory?: Array<{ role: 'customer' | 'ai'; text: string }>;
  }): string {
    const { merchant, message, chatHistory = [] } = params;

    // 1) خذ الـ finalPromptTemplate (وقد أُنشئ في pre-save hook)
    //    إذا كان فارغًا، ارفع خطأ حتى تعرف أنك نسيت إعداده.
    let prompt: string = merchant.finalPromptTemplate;
    if (!prompt) {
      throw new Error(
        'finalPromptTemplate is missing on merchant. Make sure it is generated on save.',
      );
    }

    // 2) دمج سجل المحادثة إن وجد
    if (chatHistory.length > 0) {
      const historyBlock = chatHistory
        .map(
          (m) => `[${m.role === 'customer' ? 'العميل' : 'المساعد'}]: ${m.text}`,
        )
        .join('\n');
      prompt += `\n\n## سجل المحادثة:\n${historyBlock}\n`;
    }

    // 3) إضافة سؤال العميل
    prompt += `\n\n## سؤال العميل:\n${message}\n`;

    // 4) تعليمات استدعاء الأدوات فقط إذا لم تكن مضمَّنة في finalPromptTemplate
    //    (يمكنك إزالة هذا القسم إذا تم تضمينه ضمن buildPromptFromConfig)
    prompt += `
*عند الحاجة لبيانات المنتجات أو العروض، استدعِ إحدى الدوال التالية بصيغة JSON فقط دون شرح:*
- {"function":"search_products","arguments":{"query":"نص البحث"}}
- {"function":"search_offers","arguments":{"query":"نص البحث"}}
`;

    return prompt.trim();
  }
}
