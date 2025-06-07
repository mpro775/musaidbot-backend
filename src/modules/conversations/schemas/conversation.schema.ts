// src/modules/conversations/schemas/conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: Types.ObjectId;

  @Prop() userId: string;

  @Prop({ default: 'whatsapp' })
  channel: 'whatsapp' | 'telegram' | 'mock' | 'sms';

  @Prop([
    {
      sender: String,
      text: String,
      timestamp: Date,
      channel: { type: String, default: 'whatsapp' },
    },
  ])
  messages: {
    sender: 'customer' | 'bot';
    text: string;
    timestamp: Date;
    channel: 'whatsapp' | 'telegram' | 'mock' | 'sms';
  }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
