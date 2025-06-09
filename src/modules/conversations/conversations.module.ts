// src/modules/conversations/conversations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';

// استيراد الـ Template schema
import { Template, TemplateSchema } from '../templates/schemas/template.schema';

import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Template.name, schema: TemplateSchema }, // ← أضف هذا السطر
    ]),
    HttpModule, // لاستدعاء n8n أو أي HTTP calls تحتاجها
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
