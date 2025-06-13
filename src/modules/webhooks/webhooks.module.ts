// src/modules/webhooks/webhooks.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';

import { MessagingModule } from '../messaging/message.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { ProductsModule } from '../products/products.module';
import { PromptModule } from '../prompt/prompt.module';
import { LlmModule } from '../llm/llm.module';
import { TelegramModule } from '../telegram/telegram.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    // فقط موديل Webhook لتخزين الأحداث الواردة
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
    MerchantsModule,
    ProductsModule,
    PromptModule,
    LlmModule,
    TelegramModule,
    forwardRef(() => RemindersModule), // ✅ مهم إذا في دورة

    // وحدات الاعتمادية
    MessagingModule, // لحفظ الرسائل (MessageService)
  ],
  providers: [
    WebhooksService, // خدمة معالجة الـ webhook العامة
  ],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}
