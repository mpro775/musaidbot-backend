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

  // يصبح true عند أول تفعيل (حتى نهاية التجربة أو الدفع)
  @Prop({ default: false }) isActive: boolean;

  // خطة الاشتراك الفعلية بعد انتهاء التجربة
  @Prop({ default: 'free' }) planName: string;

  // تاريخ نهاية فترة التجربة المجانية
  @Prop({ default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) })
  trialEndsAt: Date;

  // حقل يشير إن دفع بعد انتهاء التجربة
  @Prop({ default: false }) planPaid: boolean;

  // إعدادات قنوات الاتصال
  @Prop({
    type: {
      whatsapp: {
        token: { type: String },
        number: { type: String },
      },
      telegram: {
        token: { type: String },
        botUsername: { type: String },
      },
    },
    _id: false,
  })
  channelConfig: {
    whatsapp?: { token: string; number: string };
    telegram?: { token: string; botUsername: string };
  };

  // إعدادات الـ Prompt كما سبق
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
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
