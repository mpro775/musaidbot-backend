// src/modules/responses/schemas/response.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResponseDocument = Response & Document;

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  keyword: string;

  @Prop({ required: true })
  replyText: string;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
