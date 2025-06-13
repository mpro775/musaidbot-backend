// src/modules/reminders/schemas/reminder.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

@Schema({ timestamps: true })
export class Reminder {
  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  sessionId: string; // chatId أو رقم الجلسة

  @Prop({ required: true })
  channel: string; // 'telegram' | 'whatsapp' | …

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ default: false })
  isNotified: boolean; // هل تم الإشعار بالفعل؟
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
