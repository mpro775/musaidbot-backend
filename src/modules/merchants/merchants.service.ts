import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
  ) {}

  async create(createDto: CreateMerchantDto): Promise<Merchant> {
    const merchant = new this.merchantModel(createDto);
    return await merchant.save();
  }

  async findAll(): Promise<Merchant[]> {
    return await this.merchantModel.find().exec();
  }

  async findOne(id: string): Promise<MerchantDocument> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async update(id: string, updateDto: UpdateMerchantDto): Promise<Merchant> {
    const merchant = await this.merchantModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async remove(id: string): Promise<{ message: string }> {
    const merchant = await this.merchantModel.findByIdAndDelete(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return { message: 'Merchant deleted successfully' };
  }

  /**
   * مثال لفحص صلاحية الاشتراك
   * نرجع true إذا لم ينتهِ الاشتراك بعد
   */
  async isSubscriptionActive(id: string): Promise<boolean> {
    const merchant = await this.findOne(id);
    return merchant.subscriptionExpiresAt > new Date();
  }

  /**
   * قم بتمديد الاشتراك (أيام معينة)
   */
  async extendSubscription(
    id: string,
    extraDays: number,
  ): Promise<MerchantDocument> {
    const merchant = await this.findOne(id);
    const newDate = new Date(merchant.subscriptionExpiresAt);
    newDate.setDate(newDate.getDate() + extraDays);
    merchant.subscriptionExpiresAt = newDate;
    return await merchant.save(); // ✅ بدون تحذير
  }

  async upgradePlan(merchantId: string, planName: string): Promise<Merchant> {
    const merchant = await this.findOne(merchantId);
    // نفترض أن الخطط المدعومة هي: 'free', 'basic', 'pro'
    const now = Date.now();
    let addedDays = 0;
    if (planName === 'basic') addedDays = 30;
    else if (planName === 'pro') addedDays = 365;
    else throw new BadRequestException('Invalid plan name');

    merchant.planName = planName;
    merchant.subscriptionExpiresAt = new Date(
      now + addedDays * 24 * 60 * 60 * 1000,
    );
    return merchant.save();
  }
}
