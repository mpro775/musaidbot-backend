// src/modules/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { ScrapeQueue } from './scrape.queue';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly scrapeQueue: ScrapeQueue,
    private readonly remindersService: RemindersService, // ← inject here
  ) {}

  async create(
    data: Partial<Product> & { merchantId: string | Types.ObjectId },
  ): Promise<ProductDocument> {
    const dto = {
      ...data,
      merchantId:
        typeof data.merchantId === 'string'
          ? new Types.ObjectId(data.merchantId)
          : data.merchantId,
    };
    const product = await this.productModel.create(dto);

    // → اضف هذه السطور فور الإنشاء
    await this.enqueueScrapeJob({
      productId: product._id.toString(),
      url: product.originalUrl,
      merchantId: product.merchantId.toString(),
      mode: 'full',
    });

    return product;
  }

  async enqueueScrapeJob(jobData: {
    productId: string;
    url: string;
    merchantId: string;
    mode: 'full' | 'minimal';
  }) {
    return this.scrapeQueue.addJob(jobData);
  }

  async findAllByMerchant(merchantObjectId: Types.ObjectId): Promise<any[]> {
    const docs = await this.productModel
      .find({ merchantId: merchantObjectId })
      .lean()
      .exec();

    // حول حقول الـ ObjectId إلى strings
    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      merchantId: doc.merchantId.toString(),
    }));
  }
  // البحث حسب الاسم مهما كان متوفرًا أو لا
  async findByName(
    merchantId: string,
    name: string,
  ): Promise<ProductDocument | null> {
    const mId = new Types.ObjectId(merchantId);
    const regex = new RegExp(name, 'i');
    return this.productModel
      .findOne({ merchantId: mId, name: regex })
      .lean()
      .exec();
  }
  async searchProducts(
    merchantId: string | Types.ObjectId,
    query: string,
  ): Promise<ProductDocument[]> {
    const mId =
      typeof merchantId === 'string'
        ? new Types.ObjectId(merchantId)
        : merchantId;

    // 1) Exact match: الاسم يتضمن الجملة بالكامل (case-insensitive)
    const exactMatches = await this.productModel
      .find({
        merchantId: mId,
        name: { $regex: `^${escapeRegExp(query)}$`, $options: 'i' },
      })
      .lean()
      .exec();
    if (exactMatches.length) {
      return exactMatches;
    }

    // 2) Text search (تحتاج إنشاء Text Index على name و description مسبقًا):
    //    db.products.createIndex({ name: "text", description: "text" })
    const textMatches = await this.productModel
      .find(
        { merchantId: mId, $text: { $search: query }, isAvailable: true },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()
      .exec();

    return textMatches;
  }

  async setAvailability(productId: string, isAvailable: boolean) {
    const pId = new Types.ObjectId(productId);
    const product = await this.productModel
      .findByIdAndUpdate(pId, { isAvailable }, { new: true })
      .lean()
      .exec();

    if (product && isAvailable) {
      // now that it's turned available, notify any subscribers
      await this.remindersService.notifyIfAvailable(productId);
    }

    return product;
  }
  // **هنا**: نجد أنّ return type هو ProductDocument
  async findOne(id: string): Promise<ProductDocument> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException('Product not found');
    return prod;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, {
        new: true,
      })
      .exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const removed = await this.productModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Product not found');
    return { message: 'Product deleted successfully' };
  }
  async updateAfterScrape(
    productId: string,
    updateData: Partial<Product>,
  ): Promise<ProductDocument> {
    const updated = await this.productModel
      .findByIdAndUpdate(productId, updateData, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Product not found');

    return updated;
  }
  /**
   * يمر كل 10 دقائق على جميع المنتجات ويجدّد السعر والتوفّر فقط
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async scheduleMinimalScrape() {
    const products = await this.productModel
      .find()
      .select('_id originalUrl merchantId lastFetchedAt')
      .exec();
    const now = Date.now();

    for (const p of products) {
      // إذا مضى أكثر من 10 دقائق عن آخر فحص
      if (
        !p.lastFetchedAt ||
        now - p.lastFetchedAt.getTime() > 10 * 60 * 1000
      ) {
        await this.enqueueScrapeJob({
          productId: p._id.toString(),
          url: p.originalUrl,
          merchantId: p.merchantId.toString(),
          mode: 'minimal',
        });
      }
    }
  }
}

/**
 * هروب من الأحرف الخاصة في Regex
 */
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
