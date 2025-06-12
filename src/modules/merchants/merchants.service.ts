// src/modules/merchants/merchants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
  ) {}

  // إنشاء تاجر جديد
  async create(dto: CreateMerchantDto): Promise<MerchantDocument> {
    const merchant = new this.merchantModel(dto);
    merchant.finalPromptTemplate = this.buildPromptFromConfig(merchant);

    return merchant.save();
  }

  // جلب كل التجار
  async findAll(): Promise<MerchantDocument[]> {
    return this.merchantModel.find().exec();
  }

  // جلب تاجر واحد
  async findOne(
    id: string,
  ): Promise<MerchantDocument & { finalPromptTemplate: string }> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');

    // إضافة الحقل كخاصية افتراضية (بدون التأثير على قاعدة البيانات)
    merchant.finalPromptTemplate = this.buildPromptFromConfig(merchant);

    return merchant;
  }

  private buildPromptFromConfig(merchant: any): string {
    const shopName = merchant.name || 'متجرنا';
    const dialect = merchant.promptConfig?.dialect || 'فصحى';
    const tone = merchant.promptConfig?.tone || 'احترافية';

    let prompt = `أنت مساعد ذكي لخدمة العملاء في ${shopName}. مهمتك الرئيسية هي تقديم خدمة عملاء استثنائية مع الحفاظ على الصورة المهنية للمتجر.`;

    // المعلومات الأساسية عن المتجر
    prompt += `\n\n## معلومات المتجر:`;
    prompt += `\n- اسم المتجر: ${shopName}`;
    if (merchant.businessType) {
      prompt += `\n- التخصص: ${merchant.businessType}`;
    }
    if (merchant.businessDescription) {
      prompt += `\n- الوصف: ${merchant.businessDescription}`;
    }

    // أسلوب التواصل
    prompt += `\n\n## أسلوب التواصل:`;
    prompt += `\n- اللهجة: ${dialect}`;
    prompt += `\n- النغمة: ${tone}`;
    prompt += `\n- المستوى المهني: دائمًا محترف ولبق`;

    // نظام الوصول إلى بيانات المنتجات
    prompt += `\n\n## نظام بيانات المنتجات:`;
    prompt += `\n- لديك وصول إلى نظام إدارة المنتجات عبر API`;
    prompt += `\n- عند سؤال العميل عن منتج:`;
    prompt += `\n  1. استخدم وظيفة search_products(اسم_المنتج) للحصول على البيانات`;
    prompt += `\n  2. قدم للعميل المعلومات التالية:`;
    prompt += `\n     * اسم المنتج الدقيق`;
    prompt += `\n     * السعر الحالي`;
    prompt += `\n     * الكمية المتاحة`;
    prompt += `\n     * الرمز (SKU) إن وجد`;
    prompt += `\n  3. إذا لم تجد المنتج: اعتذر واقترح بدائل مشابهة`;
    prompt += `\n  4. عند طلب تفاصيل أكثر: قدم روابط أو صورًا من خلال generate_product_link(رمز_المنتج)`;

    // التعليمات التشغيلية
    prompt += `\n\n## التعليمات الأساسية:`;
    prompt += `\n1. رحب بالعميل باسم المتجر وقدم المساعدة`;
    prompt += `\n2. استخدم وظيفة البحث عن المنتجات للإجابة على الاستفسارات`;
    prompt += `\n3. تأكد من تحديث الأسعار والكميات مباشرة من النظام`;
    prompt += `\n4. عند عدم وجود إجابة: تعهد بالتواصل مع الفريق المختص`;
    prompt += `\n5. حافظ على إجابات دقيقة ومحدثة`;

    // معلومات اضافية
    if (merchant.promptConfig?.template) {
      prompt += `\n\n## تعليمات خاصة من صاحب المتجر:\n${merchant.promptConfig.template}`;
    }

    // التوقيع المهني
    prompt += `\n\n===\nدائمًا أنهِ ردك بتوقيع المتجر: "${shopName} - فريق خدمة العملاء"`;

    return prompt;
  }

  // تحديث بيانات التاجر
  async update(id: string, dto: UpdateMerchantDto): Promise<MerchantDocument> {
    const updated = await this.merchantModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Merchant not found');
    updated.finalPromptTemplate = this.buildPromptFromConfig(updated);

    return updated;
  }

  // حذف التاجر
  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.merchantModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Merchant not found');
    return { message: 'Merchant deleted successfully' };
  }

  // فحص حالة الاشتراك
  async isSubscriptionActive(id: string): Promise<boolean> {
    const merchant = await this.findOne(id);
    return merchant.subscriptionExpiresAt.getTime() > Date.now();
  }

  // تحديث إعدادات القنوات (فقط تخزين config، دون إرسال فعلي)
  async updateChannelConfig(
    id: string,
    dto: UpdateChannelDto,
  ): Promise<MerchantDocument> {
    const merchant = await this.merchantModel
      .findByIdAndUpdate(id, { channelConfig: dto }, { new: true })
      .exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  // استعلام حالة الاشتراك بتفصيل أكبر
  async getStatus(id: string) {
    const m = await this.findOne(id);
    const now = Date.now();
    const trialDaysLeft = Math.max(
      0,
      Math.ceil((m.trialEndsAt.getTime() - now) / (24 * 60 * 60 * 1000)),
    );
    const channelsConnected = Object.entries(m.channelConfig || {})
      .filter(([, cfg]) => Boolean(cfg))
      .map(([k]) => k);
    return {
      merchantId: id,
      isActive: m.subscriptionExpiresAt.getTime() > now,
      trialEndsAt: m.trialEndsAt,
      subscriptionExpiresAt: m.subscriptionExpiresAt,
      planName: m.planName,
      planPaid: m.planPaid,
      trialDaysLeft,
      channelsConnected,
    };
  }
}
