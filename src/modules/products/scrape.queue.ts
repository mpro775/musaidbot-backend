// src/modules/products/scrape.queue.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { RedisConfig } from '../../config/redis.config';
import { ScraperService } from '../scraper/scraper.service';
import { ProductsService } from './products.service';

@Injectable()
export class ScrapeQueue implements OnModuleInit {
  private readonly logger = new Logger(ScrapeQueue.name);
  private queue: Queue;

  constructor(
    private readonly redisConfig: RedisConfig,
    private readonly scraperService: ScraperService,
    private readonly productsService: ProductsService,
  ) {}

  onModuleInit() {
    this.queue = new Queue('product-scrape-queue', {
      connection: this.redisConfig.connection,
    });

    // إنشاء Worker لمعالجة مهام الـ Scraping
    new Worker(
      'product-scrape-queue',
      async (job: Job) => {
        const { productId, url } = job.data as {
          productId: string;
          url: string;
        };

        try {
          // استدعاء دالة ScraperService لجلب الحقول الجديدة
          const { name, price, inStock, images, description } =
            await this.scraperService.scrapeProduct(url);

          // تحديث سجل المنتج في قاعدة البيانات بعد جلب البيانات
          await this.productsService.updateAfterScrape(productId, {
            name,
            price,
            isAvailable: inStock,
            images,
            description,
            lastScrapedAt: new Date(),
            errorState: '',
          });

          this.logger.log(`Scraped and updated product ${productId}`);
        } catch (err) {
          // في حال وقوع خطأ
          await this.productsService.updateAfterScrape(productId, {
            errorState: (err as Error).message,
            lastScrapedAt: new Date(),
          });
          this.logger.error(
            `Failed to scrape product ${productId}: ${(err as Error).message}`,
          );
        }
      },
      { connection: this.redisConfig.connection },
    );
  }

  async addJob(data: { productId: string; url: string; merchantId: string }) {
    await this.queue.add('scrape', data);
  }
}
