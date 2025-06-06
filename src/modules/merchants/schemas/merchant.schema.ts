import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  logoUrl: string;

  @Prop()
  address: string;

  @Prop({ default: false })
  isActive: boolean; // حالة التاجر (مفعل/غير مفعل)

  @Prop({ default: Date.now })
  subscriptionExpiresAt: Date; // تاريخ انتهاء الاشتراك
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
