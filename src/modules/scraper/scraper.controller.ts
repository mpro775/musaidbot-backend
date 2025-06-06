import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

class ScrapeUrlDto {
  url: string;
}

@ApiTags('Scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  /**
   * @api {post} /scraper/run تنفيذ عملية Scraping لرابط منتج
   * @apiName RunScraping
   * @apiGroup Scraper
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} url رابط صفحة المنتج المراد استخلاص بياناته.
   *
   * @apiSuccess {String} name اسم المنتج المُستخلص.
   * @apiSuccess {String} price سعر المنتج المُستخلص.
   *
   * @apiError (400) BadRequest إذا لم يُرسل رابط صحيح.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   * @apiError (500) InternalServerError انكشاف خطأ أثناء أداء Scraping.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run scraping for a product URL (protected)' })
  @ApiResponse({ status: 200, description: 'Product scraped successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UseGuards(JwtAuthGuard)
  @Post('run')
  async runScraping(@Body() dto: ScrapeUrlDto) {
    return this.scraperService.scrapeProduct(dto.url);
  }
}
