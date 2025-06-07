import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Document &
  Conversation & { _id: Types.ObjectId }; // ✅ هنا الإضافة المهمة

class Message {
  @Prop({ enum: ['customer', 'bot'], required: true })
  sender: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [Message], default: [] })
  messages: Message[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
