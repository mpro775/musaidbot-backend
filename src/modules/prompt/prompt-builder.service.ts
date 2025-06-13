import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBuilderService {
  buildPrompt({
    merchant,
    products,
    message,
    chatHistory = [],
  }: {
    merchant: any;
    products: any[];
    message: string;
    chatHistory?: any[];
  }): string {
    // 1. إعداد قالب البرومبت الأساسي (من إعدادات التاجر أو القالب الافتراضي)
    let prompt: string =
      merchant.finalPromptTemplate ||
      `
أنت مساعد ذكي لخدمة العملاء في ${merchant.name}.
مهمتك الرد على العملاء بسرعة وبدقة ولباقة.

معلومات المتجر:
- اسم المتجر: ${merchant.name}
- التخصص: ${merchant.businessType}
- الوصف: ${merchant.businessDescription || '-'}

أسلوب التواصل:
- اللهجة: ${merchant.promptConfig?.dialect || 'محايد'}
- النغمة: ${merchant.promptConfig?.tone || 'محايد'}

دائمًا أنهِ ردك بتوقيع المتجر: "${merchant.name} - فريق خدمة العملاء"
`;

    // 2. تلخيص قائمة المنتجات (لو طويلة خذ أول 5-10 فقط)
    if (products && products.length) {
      const productList = products
        .slice(0, 5)
        .map(
          (p, idx) =>
            `${idx + 1}. ${p.name} — السعر: ${p.price} ريال، متوفر: ${p.isAvailable ? 'نعم' : 'لا'}`,
        )
        .join('\n');
      prompt += `\n\n# قائمة مختصرة من المنتجات:\n${productList}\n`;
    } else {
      prompt += `\n\n# لا توجد منتجات متاحة حاليًا في النظام.\n`;
    }

    // 3. دمج سجل المحادثة (اختياري حاليًا)
    if (chatHistory && chatHistory.length) {
      const historyBlock = chatHistory
        .map(
          (msg) =>
            `[${msg.role === 'customer' ? 'العميل' : 'المساعد'}]: ${msg.text}`,
        )
        .join('\n');
      prompt += `\n\n# سجل المحادثة:\n${historyBlock}\n`;
    }

    // 4. إضافة رسالة العميل في النهاية (كأهم مدخل للـ LLM)
    prompt += `\n\n# رسالة العميل الحالية:\n${message}\n`;

    // 5. (اختياري) تعليمات ثابتة أو ديناميكية من إعدادات التاجر
    // يمكنك لاحقًا دمج المزيد مثل تعليمات خاصة حسب خطة الاشتراك أو الذكاء الاصطناعي المختار

    return prompt;
  }
}
