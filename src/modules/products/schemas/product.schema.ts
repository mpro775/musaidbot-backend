// src/modules/products/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  description: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ required: true })
  merchantId: string; // ID للتاجر صاحب المنتج
}

export const ProductSchema = SchemaFactory.createForClass(Product);
