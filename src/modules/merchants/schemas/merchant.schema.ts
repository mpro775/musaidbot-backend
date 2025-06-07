// src/modules/merchants/schemas/merchant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name: string; // اسم المتجر

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  whatsappNumber: string;

  @Prop()
  logoUrl: string;

  @Prop()
  address: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: 'free' })
  planName: string; // 'free' | 'basic' | 'pro' | …

  @Prop({ default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
  subscriptionExpiresAt: Date;

  @Prop({ default: true })
  autoReplyEnabled: boolean;

  // حقل الربط بمدخل User
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
