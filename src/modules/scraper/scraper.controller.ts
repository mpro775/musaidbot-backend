import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class ScrapeUrlDto {
  url: string;
}

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // إضافة حماية JWT للتأكد من هوية التاجر قبل السماح له باستخلاص روابط المنتجات
  @UseGuards(JwtAuthGuard)
  @Post('run')
  async runScraping(@Body() dto: ScrapeUrlDto) {
    return this.scraperService.scrapeProduct(dto.url);
  }
}
