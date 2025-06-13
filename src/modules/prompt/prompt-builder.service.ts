// src/modules/prompt/prompt-builder.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilderService {
  buildPrompt({
    merchant,
    message,
    chatHistory = [],
  }: {
    merchant: any;
    message: string;
    chatHistory?: any[];
  }): string {
    // 1. القالب الأساسي + سياسات المتجر
    let prompt: string =
      merchant.finalPromptTemplate ||
      `
أنت مساعد ذكي لخدمة العملاء في ${merchant.name}.
مهمتك الرد بسرعة وبدقة ولباقة.

## معلومات المتجر:
- اسم المتجر: ${merchant.name}
- التخصص: ${merchant.businessType}
- الوصف: ${merchant.businessDescription || '-'}

## سياسات المتجر:
${
  merchant.returnPolicy
    ? `- سياسة الإرجاع: ${merchant.returnPolicy}`
    : '- لا توجد سياسة إرجاع مفعّلة.'
}
${
  merchant.exchangePolicy
    ? `- سياسة الاستبدال: ${merchant.exchangePolicy}`
    : '- لا توجد سياسة استبدال مفعّلة.'
}
${
  merchant.shippingPolicy
    ? `- سياسة الشحن: ${merchant.shippingPolicy}`
    : '- لا توجد سياسة شحن مفعّلة.'
}

إذا سُئلت عن أي سياسة غير موجودة، اعتذر وأبلغ العميل بأنها غير متوفرة حاليًا.

دائمًا أنهِ ردك بتوقيع المتجر: "${merchant.name} - فريق خدمة العملاء"
`;

    // 2. دمج سجل المحادثة إن وجد
    if (chatHistory.length) {
      const historyBlock = chatHistory
        .map(
          (m) => `[${m.role === 'customer' ? 'العميل' : 'المساعد'}]: ${m.text}`,
        )
        .join('\n');
      prompt += `\n\n## سجل المحادثة:\n${historyBlock}\n`;
    }

    // 3. إضافة سؤال العميل
    prompt += `\n\n## سؤال العميل:\n${message}\n`;

    // 4. تعليمات استدعاء الأدوات (Tool Calling)
    prompt += `
*عند الحاجة لبيانات المنتجات أو العروض، استدعِ إحدى الدوال التالية بصيغة JSON فقط دون شرح:*
- {"function":"search_products","arguments":{"query":"نص البحث"}}
- {"function":"search_offers","arguments":{"query":"نص البحث"}}
`;

    return prompt.trim();
  }
}
