// src/modules/analytics/missing-query.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MissingQuery,
  MissingQueryDocument,
} from './schemas/missing-query.schema';

@Injectable()
export class MissingQueryService {
  constructor(
    @InjectModel(MissingQuery.name)
    private readonly missingModel: Model<MissingQueryDocument>,
  ) {}

  async log(
    merchantId: string | Types.ObjectId,
    sessionId: string,
    channel: string,
    question: string,
    type: 'product_not_found' | 'offer_not_found' | 'unanswered' | 'other',
  ) {
    const mId =
      typeof merchantId === 'string'
        ? new Types.ObjectId(merchantId)
        : merchantId;
    await this.missingModel.create({
      merchantId: mId,
      sessionId,
      channel,
      question,
      type,
    });
  }

  // تحليل: عدّ الاستفسارات الفاشلة لكل تاجر
  async countByType(merchantId: string) {
    const mId = new Types.ObjectId(merchantId);
    return this.missingModel.aggregate([
      { $match: { merchantId: mId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
  }

  // أكثر الأسئلة تكرارًا (top N)
  async topQuestions(merchantId: string, limit = 10) {
    const mId = new Types.ObjectId(merchantId);
    return this.missingModel.aggregate([
      { $match: { merchantId: mId } },
      { $group: { _id: '$question', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }
}
