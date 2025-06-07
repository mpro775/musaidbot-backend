import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfigModule } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { PlansModule } from './modules/plans/plans.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseModule } from './modules/responses/response.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseConfigModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ResponseModule,
    WhatsappModule,

    MerchantsModule,
    ConversationsModule,
    PlansModule,
    WebhooksModule,
    ScraperModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // يفعل الـ RolesGuard على كل النقاط
    },
  ],
})
export class AppModule {}
