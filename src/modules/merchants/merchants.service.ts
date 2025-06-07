import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatesService } from '../templates/templates.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { TemplateDocument } from '../templates/schemas/template.schema';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
    private readonly templateService: TemplatesService,
    private readonly whatsappService: WhatsappService,

    private readonly templateModel: Model<TemplateDocument>, // ← هنا
  ) {}

  async create(dto: CreateMerchantDto): Promise<MerchantDocument> {
    const merchant = new this.merchantModel(dto);
    return merchant.save();
  }

  async findAll(): Promise<MerchantDocument[]> {
    return this.merchantModel.find().exec();
  }

  async findOne(id: string): Promise<MerchantDocument> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async update(id: string, dto: UpdateMerchantDto): Promise<MerchantDocument> {
    const merchant = await this.merchantModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async remove(id: string): Promise<{ message: string }> {
    const merchant = await this.merchantModel.findByIdAndDelete(id).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    return { message: 'Merchant deleted successfully' };
  }

  async isSubscriptionActive(id: string): Promise<boolean> {
    const merchant = await this.findOne(id);
    return merchant.subscriptionExpiresAt.getTime() > Date.now();
  }

  async sendTestMessage(
    merchantId: string,
    {
      templateId,
      to,
      variables,
    }: { templateId: string; to: string; variables: string[] },
  ): Promise<{ success: boolean; messageId?: string }> {
    const merchant = await this.findOne(merchantId);
    const tpl = await this.templateService.findById(templateId);
    let text = tpl.body;
    variables.forEach((v, i) => (text = text.replace(`{{${i + 1}}}`, v)));

    if (!merchant.channelConfig.whatsapp) {
      throw new BadRequestException('WhatsApp not configured');
    }

    // نفّذ الإرسال وانتظر النتيجة
    const response = await this.whatsappService.send(
      merchant.channelConfig.whatsapp,
      to,
      text,
    );

    // استخرج معرف الرسالة مباشرة من response.messageId
    const messageId = response.messageId;

    return { success: true, messageId };
  }

  async extendSubscription(
    id: string,
    extraDays: number,
  ): Promise<MerchantDocument> {
    const merchant = await this.findOne(id);
    merchant.subscriptionExpiresAt = new Date(
      merchant.subscriptionExpiresAt.getTime() +
        extraDays * 24 * 60 * 60 * 1000,
    );
    return merchant.save();
  }

  async upgradePlan(
    merchantId: string,
    planName: string,
  ): Promise<MerchantDocument> {
    const merchant = await this.findOne(merchantId);
    const addedDays = planName === 'basic' ? 30 : planName === 'pro' ? 365 : 0;
    if (!addedDays) throw new BadRequestException('Invalid plan name');
    merchant.planName = planName;
    merchant.subscriptionExpiresAt = new Date(
      Date.now() + addedDays * 24 * 60 * 60 * 1000,
    );
    merchant.planPaid = true;
    return merchant.save();
  }

  async updateChannelConfig(
    id: string,
    dto: UpdateChannelDto,
  ): Promise<MerchantDocument> {
    const m = await this.merchantModel.findByIdAndUpdate(
      id,
      { channelConfig: dto },
      { new: true },
    );
    if (!m) throw new NotFoundException('Merchant not found');
    return m;
  }

  async createTemplate(
    merchantId: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateDocument> {
    const tpl = new this.templateModel({
      merchantId,
      name: dto.name,
      body: dto.body,
    });
    return tpl.save();
  }

  async getStatus(id: string) {
    const m = await this.findOne(id);
    const now = Date.now();
    const trialDaysLeft = Math.max(
      0,
      Math.ceil((m.trialEndsAt.getTime() - now) / (24 * 60 * 60 * 1000)),
    );
    const channelsConnected = Object.keys(m.channelConfig || {}).filter(
      (k) => !!m.channelConfig[k],
    );
    return {
      isActive: m.isActive,
      trialEndsAt: m.trialEndsAt,
      subscriptionExpiresAt: m.subscriptionExpiresAt,
      planName: m.planName,
      planPaid: m.planPaid,
      trialDaysLeft,
      channelsConnected,
    };
  }

  validateTrial(merchant: MerchantDocument) {
    if (!merchant.planPaid && new Date() > merchant.trialEndsAt) {
      throw new ForbiddenException('Trial expired');
    }
  }
}
