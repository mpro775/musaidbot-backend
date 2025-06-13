// src/modules/analytics/schemas/missing-query.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MissingQueryDocument = MissingQuery & Document;

@Schema({ timestamps: true })
export class MissingQuery {
  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  channel: string; // telegram, whatsapp, …

  @Prop({ required: true })
  question: string;

  @Prop({
    type: String,
    enum: ['product_not_found', 'offer_not_found', 'unanswered', 'other'],
    default: 'other',
  })
  type: string;
}

export const MissingQuerySchema = SchemaFactory.createForClass(MissingQuery);
