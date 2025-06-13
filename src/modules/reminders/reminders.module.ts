// src/modules/reminders/reminders.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';
import { RemindersService } from './reminders.service';
import { ProductsModule } from '../products/products.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
    forwardRef(() => ProductsModule), // ✅ وهذا أيضًا ضروري
    MerchantsModule,
    TelegramModule,
  ],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
