import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

class Message {
  sender: string;
  text: string;
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  merchantId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [
      {
        sender: String,
        text: String,
        timestamp: Date,
      },
    ],
    default: [],
  })
  messages: Message[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
