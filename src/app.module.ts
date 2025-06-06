// src/app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseConfigModule } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { PlansModule } from './modules/plans/plans.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
  imports: [
    DatabaseConfigModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    MerchantsModule,
    ConversationsModule,
    PlansModule,
    WebhooksModule,
    ScraperModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
