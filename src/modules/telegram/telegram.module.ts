import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramService],
  exports: [TelegramService], // لتستخدمها في أي مكان آخر
})
export class TelegramModule {}
