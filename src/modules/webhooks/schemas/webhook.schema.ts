import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookDocument = Webhook & Document;

@Schema({ timestamps: true })
export class Webhook {
  @Prop({ required: true })
  eventType: string;

  @Prop({ type: Object, default: {} })
  payload: any;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
