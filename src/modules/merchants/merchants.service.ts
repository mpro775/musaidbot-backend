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
    return merchant.save();
  }

  // جلب كل التجار
  async findAll(): Promise<MerchantDocument[]> {
    return this.merchantModel.find().exec();
  }

  // جلب تاجر واحد
  async findOne(id: string): Promise<MerchantDocument> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  // تحديث بيانات التاجر
  async update(id: string, dto: UpdateMerchantDto): Promise<MerchantDocument> {
    const updated = await this.merchantModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Merchant not found');
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
