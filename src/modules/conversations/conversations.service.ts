// src/modules/conversations/conversations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  /** إنشاء محادثة جديدة */
  async create(dto: CreateConversationDto): Promise<ConversationDocument> {
    const convo = new this.conversationModel({
      merchantId: new Types.ObjectId(dto.merchantId),
      userId: dto.userId,
      channel: dto.channel,
    });
    return convo.save();
  }

  /** ضمان وجود محادثة أو إنشاؤها */
  async ensureConversation(
    merchantId: string,
    userId: string,
  ): Promise<ConversationDocument> {
    // 1) صرّح النوع هنا:
    let convo: ConversationDocument | null = await this.conversationModel
      .findOne({ merchantId: new Types.ObjectId(merchantId), userId })
      .exec();

    if (!convo) {
      const dto: CreateConversationDto = {
        merchantId,
        userId,
        channel: 'unknown',
      };
      convo = await this.create(dto);
    }

    // 2) non-null assertion علشان تتخلص من null في التايب
    return convo;
  }

  /** جلب جميع المحادثات لتاجر */
  async findAllByMerchant(merchantId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .exec();
  }

  /** جلب محادثة واحدة بالمعرّف */
  async findOne(id: string): Promise<ConversationDocument> {
    const convo = await this.conversationModel.findById(id).exec();
    if (!convo) throw new NotFoundException('Conversation not found');
    return convo;
  }
  async findOrCreateConversation(merchantId: string, userId: string) {
    let conv = await this.conversationModel
      .findOne({ merchantId, userId })
      .exec();
    if (!conv) {
      conv = await this.conversationModel.create({ merchantId, userId });
    }
    return conv;
  }
  /** حذف المحادثة */
  async remove(id: string): Promise<{ message: string }> {
    await this.conversationModel.deleteOne({ _id: id }).exec();
    return { message: 'Conversation deleted successfully' };
  }
}
