// src/modules/whatsapp/whatsapp.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { Response, ResponseSchema } from '../responses/schemas/response.schema';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema';
import { Merchant, MerchantSchema } from '../merchants/schemas/merchant.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }), // لاستخدام JWT عند إرسال المحادثات
    MongooseModule.forFeature([
      { name: Response.name, schema: ResponseSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Merchant.name, schema: MerchantSchema },
    ]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
