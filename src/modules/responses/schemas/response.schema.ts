// src/modules/responses/schemas/response.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Response {
  @Prop({ required: true })
  merchantId: string;

  @Prop({ required: true })
  keyword: string;

  @Prop({ required: true })
  replyText: string;

  // أضف هذين الحقلين كي يعرفهما TS
  createdAt: Date;
  updatedAt: Date;
}

// الآن HydratedDocument<Response> يعرف _id وcreatedAt وupdatedAt
export type ResponseDocument = HydratedDocument<Response>;

export const ResponseSchema = SchemaFactory.createForClass(Response);
