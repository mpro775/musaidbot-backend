// src/modules/products/products.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ScrapeQueue } from './scrape.queue';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    forwardRef(() => ScraperModule),
    BullModule.registerQueue({ name: 'scrape' }),
  ],
  providers: [ProductsService, ScrapeQueue],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
