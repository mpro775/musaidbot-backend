// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ScrapeQueue } from './scrape.queue';
import { ScraperModule } from '../scraper/scraper.module';
import { RedisConfig } from '../../config/redis.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ScraperModule, // لتضمين ScraperService
  ],
  providers: [
    ProductsService,
    ScrapeQueue,
    RedisConfig, // حتى يتم حقن إعدادات Redis داخليًا
  ],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
