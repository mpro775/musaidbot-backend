import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from '../conversations/schemas/conversation.schema';

interface ChannelCount {
  _id: string;
  count: number;
}

export interface AnalyticsOverview {
  totalConversations: number;
  messagesByChannel: Record<string, number>;
}
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly convModel: Model<ConversationDocument>,
  ) {}

  /**
   * يعطي نظرة عامة على المحادثات لتاجر معين
   * @param merchantId معرف التاجر
   */
  async overview(merchantId: string): Promise<AnalyticsOverview> {
    const filter = { merchantId: new Types.ObjectId(merchantId) };
    const totalConversations = await this.convModel
      .countDocuments(filter)
      .exec();

    // تحديد نوع النتيجة لتجنب any
    const byChannel: ChannelCount[] = await this.convModel
      .aggregate<ChannelCount>([
        { $match: filter },
        { $unwind: '$messages' },
        { $group: { _id: '$messages.channel', count: { $sum: 1 } } },
      ])
      .exec();

    const messagesByChannel = byChannel.reduce<Record<string, number>>(
      (acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      },
      {},
    );

    return {
      totalConversations,
      messagesByChannel,
    };
  }
}
