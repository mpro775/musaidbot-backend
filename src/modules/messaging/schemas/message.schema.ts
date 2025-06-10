import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  merchantId: string;

  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: true })
  channel: string; // e.g. 'whatsapp', 'telegram', 'webchat', etc.

  @Prop({ required: true, enum: ['customer', 'bot'] })
  role: 'customer' | 'bot';

  @Prop({ required: true })
  text: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
