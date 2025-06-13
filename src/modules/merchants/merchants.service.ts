// src/modules/merchants/merchants.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { buildPromptFromMerchant } from './utils/prompt-builder';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
    private http: HttpService,
  ) {}

  // إنشاء تاجر جديد
  async create(createDto: CreateMerchantDto): Promise<MerchantDocument> {
    // 1) أنشئ التاجر أولاً
    const created = new this.merchantModel(createDto);
    await created.save();

    // 2) لو العميل أعطى توكن تلجرام، جهّز URL الويبهوك
    const token = createDto.channelConfig?.telegram?.token;
    if (token) {
      // ثابت عندك:
      const N8N_BASE = 'https://abdulsalam-n8n.up.railway.app';
      const WORKFLOW_ID = '8ae43b54-0ebe-4b1c-8824-bace684c6573';

      const hookUrl = `${N8N_BASE}/webhook/${WORKFLOW_ID}/webhooks/telegram_incoming/${created.id}`;

      try {
        // 3) سجّل الـ webhook في Telegram API
        const telegramApi = `https://api.telegram.org/bot${token}/setWebhook`;
        await firstValueFrom(
          this.http.post(telegramApi, { params: { url: hookUrl } }),
        );

        // 4) احفظه في الحقل webhookUrl
        created.webhookUrl = hookUrl;
        await created.save();
      } catch (err) {
        // لو فشل تسجيل الويبهوك، إحذف التاجر أو أرجع خطأ مناسب
        throw new InternalServerErrorException(
          `فشل إنشاء webhook في تلجرام: ${err.message}`,
        );
      }
    }

    return created;
  }

  // جلب كل التجار
  async findAll(): Promise<MerchantDocument[]> {
    return this.merchantModel.find().exec();
  }

  async registerTelegramWebhook(
    merchantId: string,
  ): Promise<{ hookUrl: string; telegramResponse: any }> {
    const merchant = await this.merchantModel.findById(merchantId).exec();
    if (!merchant) {
      throw new NotFoundException(`التاجر بالـ ID ${merchantId} غير موجود`);
    }

    // تأكد من وجود توكن تلجرام مُخزّن
    const token = merchant.channelConfig?.telegram?.token;
    if (!token) {
      throw new BadRequestException(`لا يوجد Telegram token لهذا التاجر`);
    }

    // بناء URL للويب هوك على n8n
    const N8N_BASE =
      process.env.N8N_BASE_URL || 'https://abdulsalam-n8n.up.railway.app';
    const WORKFLOW_ID =
      process.env.N8N_WORKFLOW_ID || '8ae43b54-0ebe-4b1c-8824-bace684c6573';
    const hookUrl = `${N8N_BASE}/webhook/${WORKFLOW_ID}/webhooks/telegram_incoming/${merchant.id}`;

    try {
      // إرسال طلب إلى Telegram API
      const telegramApi = `https://api.telegram.org/bot${token}/setWebhook`;
      const resp = await firstValueFrom(
        this.http.post(telegramApi, null, { params: { url: hookUrl } }),
      );

      // حفظ الـ webhookUrl في قاعدة البيانات
      merchant.webhookUrl = hookUrl;
      await merchant.save();

      return {
        hookUrl,
        telegramResponse: resp.data,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `فشل تسجيل الويب هوك في تلجرام: ${err.message}`,
      );
    }
  }

  // جلب تاجر واحد
  async findOne(
    id: string,
  ): Promise<MerchantDocument & { finalPromptTemplate: string }> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');

    // إضافة الحقل كخاصية افتراضية (بدون التأثير على قاعدة البيانات)
    merchant.finalPromptTemplate = buildPromptFromMerchant(merchant);

    return merchant;
  }

  // تحديث بيانات التاجر
  async update(id: string, dto: UpdateMerchantDto): Promise<MerchantDocument> {
    console.log('🟡 تحديث التاجر', id, dto);

    const updated = await this.merchantModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      console.error('🔴 لم يتم العثور على التاجر');
      throw new NotFoundException('Merchant not found');
    }

    updated.set('finalPromptTemplate', buildPromptFromMerchant(updated));
    await updated.save();

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
