import { Injectable } from '@nestjs/common';

@Injectable()
export class IntentClassifierService {
  /**
   * كشف نية "استفسار عن منتج بصيغة صريحة"
   * مثل: هل لديكم آيفون 14؟
   */
  detectExplicitProductQuery(text: string): string | null {
    const match = text.match(/هل\s+لديكم?\s+(.+)\??$/i);
    return match ? match[1].trim() : null;
  }

  /**
   * كشف نية "طلب منتج بصيغة مباشرة"
   * مثل: أبغى/أبي/عندكم + اسم منتج
   */
  detectDirectProductDemand(text: string): string | null {
    const match = text.match(/^(أبغى|أبي|عندكم)\s+(.+)/i);
    return match ? match[2].trim() : null;
  }

  /**
   * كشف إن كانت الرسالة تأكيد مثل "نعم"
   */
  isReminderConfirmation(text: string): boolean {
    return /^نعم$/i.test(text.trim());
  }

  /**
   * كشف إن كانت الرسالة عبارة عن ترحيب أو غير مفيدة
   */
  isGreetingOrNoise(text: string): boolean {
    return /^(هلا|السلام( عليكم)?|مرحبا|هاي|مم+|👍+|🙂+|😊+)$/.test(
      text.trim(),
    );
  }

  /**
   * كشف إن كانت الرسالة طلب مساعدة أو دعم
   */
  isHelpRequest(text: string): boolean {
    return /(مساعدة|احتاج مساعدة|كيف أطلب|طريقة الطلب)/i.test(text);
  }

  /**
   * كشف إن كانت الرسالة استفسار عن الشحن أو الضمان
   */
  detectLogisticsIntent(text: string): 'shipping' | 'warranty' | null {
    if (/شحن|توصيل|مدة الشحن/i.test(text)) return 'shipping';
    if (/ضمان|استرجاع|استبدال/i.test(text)) return 'warranty';
    return null;
  }
}
