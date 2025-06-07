// src/modules/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { ScrapeQueue } from './scrape.queue';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly scrapeQueue: ScrapeQueue,
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
    return this.productModel.create(dto);
  }

  async enqueueScrapeJob(jobData: {
    productId: string;
    url: string;
    merchantId: string;
  }) {
    return this.scrapeQueue.addJob(jobData);
  }

  async findAllByMerchant(merchantId: string): Promise<ProductDocument[]> {
    return this.productModel.find({ merchantId }).exec();
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
}
