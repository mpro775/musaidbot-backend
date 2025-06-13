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

    const normalized = normalizeQuery(query);
    const regex = new RegExp(escapeRegExp(normalized), 'i');

    // 1️⃣ محاولة التطابق الجزئي
    const partialMatches = await this.productModel
      .find({
        merchantId: mId,
        isAvailable: true,
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { keywords: { $in: [normalized] } },
        ],
      })
      .limit(10)
      .lean();

    if (partialMatches.length > 0) return partialMatches;

    // 2️⃣ محاولة البحث النصي الكامل
    try {
      const textMatches = await this.productModel
        .find(
          {
            merchantId: mId,
            $text: { $search: normalized },
            isAvailable: true,
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .lean();
      if (textMatches.length > 0) return textMatches;
    } catch (err) {
      console.warn('[searchProducts] Text index not found:', err.message);
    }

    // 3️⃣ fallback: تحليل كل كلمة على حدة (token match)
    const tokens = normalized.split(/\s+/);
    const tokenRegexes = tokens.map((t) => new RegExp(escapeRegExp(t), 'i'));

    const tokenMatches = await this.productModel
      .find({
        merchantId: mId,
        isAvailable: true,
        $or: [
          { name: { $in: tokenRegexes } },
          { description: { $in: tokenRegexes } },
          { category: { $in: tokenRegexes } },
          { keywords: { $in: tokens } },
        ],
      })
      .limit(10)
      .lean();

    return tokenMatches;
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
  async getFallbackProducts(
    merchantId: string | Types.ObjectId,
    limit = 20,
  ): Promise<ProductDocument[]> {
    const mId =
      typeof merchantId === 'string'
        ? new Types.ObjectId(merchantId)
        : merchantId;

    return this.productModel
      .find({ merchantId: mId, isAvailable: true })
      .sort({ lastFetchedAt: -1 }) // أو { createdAt: -1 } حسب ما يناسب
      .limit(limit)
      .lean()
      .exec();
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

function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[؟?]/g, '')
    .replace(
      /\b(هل|عندك|عندكم|فيه|يتوفر|أحتاج|أبي|ابغى|ممكن|وش|شو|ايش|لو سمحت)\b/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .replace(/كايبلات|كيبلات|كابلات|كابلات|كبلات/gi, 'كيبل')
    .replace(/سماعات|سماعه|هيدفون/gi, 'سماعة')
    .replace(/شواحن|شاحنات/gi, 'شاحن')
    .trim();
}
