// src/modules/conversations/conversations.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findByMerchantAndCustomer(
    merchantId: string,
    customerNumber: string,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel.findOne({
      merchantId: new Types.ObjectId(merchantId),
      userId: customerNumber,
    });
  }

  async create(data: Partial<Conversation>): Promise<ConversationDocument> {
    return this.conversationModel.create(data);
  }

  async addMessage(
    conversationId: string,
    message: { sender: string; text: string; timestamp: Date },
  ): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $push: { messages: message } },
    );
  }
  async ensureConversation(
    merchantId: string,
    customerNumber: string,
  ): Promise<ConversationDocument> {
    let convo = await this.conversationModel.findOne({
      merchantId,
      userId: customerNumber,
    });

    if (!convo) {
      convo = await this.conversationModel.create({
        merchantId,
        userId: customerNumber,
        messages: [],
      });
    }

    return convo;
  }
}
