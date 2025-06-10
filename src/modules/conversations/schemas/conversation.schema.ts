import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 'whatsapp' })
  channel: 'whatsapp' | 'telegram' | 'mock' | 'sms';

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// هنا نصرّح صراحةً أن ConversationDocument فيه _id من نوع ObjectId
export type ConversationDocument = Document<unknown, any, Conversation> &
  Conversation & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };
