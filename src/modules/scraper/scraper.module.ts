import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';

@Module({
  providers: [ScraperService],
  imports: [
    // سجل الـ queue باسم "scraper"
    BullModule.registerQueue({
      name: 'scraper',
    }),
    // ... أي imports أخرى
  ],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
