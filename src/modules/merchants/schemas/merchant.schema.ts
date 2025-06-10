// 1. توسيع Merchant Schema ليشمل التجربة المجانية وإعدادات القنوات
// src/modules/merchants/schemas/merchant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true }) whatsappNumber: string;
  @Prop() logoUrl: string;
  @Prop() address: string;

  // الحالة: trial / active / banned
  @Prop({
    required: true,
    enum: ['trial', 'active', 'banned'],
    default: 'trial',
  })
  status: 'trial' | 'active' | 'banned';

  @Prop({ default: false }) isActive: boolean;
  @Prop({ default: 'free' }) planName: string;

  @Prop({
    required: true,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  })
  trialEndsAt: Date;

  @Prop({ default: false }) planPaid: boolean;

  @Prop({
    type: {
      whatsapp: { token: String, number: String },
      telegram: { token: String, botUsername: String },
    },
    _id: false,
  })
  @Prop({ type: Object }) // أو استخدم Schema type حسب الحاجة
  channelConfig: {
    telegram?: {
      chatId?: string;
      botToken?: string;
    };
    whatsapp?: {
      phone?: string;
    };
  };
  @Prop()
  apiToken: string;

  @Prop({
    type: {
      dialect: { type: String, default: 'خليجي' },
      tone: { type: String, default: 'ودّي' },
      template: { type: String, default: '' },
    },
    _id: false,
  })
  promptConfig: {
    dialect: string;
    tone: string;
    template: string;
  };

  @Prop({
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })
  subscriptionExpiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop()
  businessType: string;

  @Prop()
  businessDescription: string;

  @Prop({ default: 'formal' }) // القيم الممكنة: 'formal', 'gulf', 'egyptian', إلخ
  preferredDialect: string;
}
export const MerchantSchema = SchemaFactory.createForClass(Merchant);
