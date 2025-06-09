// src/modules/products/products.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull'; // ← استيراد BullModule
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ScrapeQueue } from './scrape.queue';
import { ScraperModule } from '../scraper/scraper.module';
import { RedisConfig } from '../../config/redis.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ScraperModule, // يحوي ScraperService
    forwardRef(() => ScraperModule),
    BullModule.registerQueue({ name: 'scrape' }),
  ],
  providers: [ProductsService, ScrapeQueue, RedisConfig],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
