// src/modules/templates/schemas/template.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Template {
  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  body: string;
}

// هنا نُعرِّف الـ Document ليشمل الحقول الإضافية بفضل timestamps:
export type TemplateDocument = Template &
  Document & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export const TemplateSchema = SchemaFactory.createForClass(Template);
