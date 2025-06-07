// src/modules/conversations/conversations.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, HydratedDocument } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  /** إنشاء محادثة جديدة */
  async create(
    dto: CreateConversationDto,
  ): Promise<HydratedDocument<Conversation>> {
    const convo = new this.conversationModel({
      merchantId: new Types.ObjectId(dto.merchantId),
      userId: dto.userId,
      messages: dto.messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      })),
    });
    return convo.save();
  }

  /** جلب جميع المحادثات لتاجر */
  async findAllByMerchant(
    merchantId: string,
  ): Promise<HydratedDocument<Conversation>[]> {
    return this.conversationModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .exec();
  }

  /** جلب محادثة واحدة بالـ ID */
  async findOne(id: string): Promise<HydratedDocument<Conversation>> {
    const convo = await this.conversationModel.findById(id).exec();
    if (!convo) throw new NotFoundException('Conversation not found');
    return convo;
  }

  /** إضافة رسالة وإرجاع المحادثة بعد التحديث */
  async addMessage(
    convoId: string,
    messageDto: AddMessageDto,
  ): Promise<HydratedDocument<Conversation>> {
    const convo = await this.findOne(convoId);
    convo.messages.push({
      sender: messageDto.sender,
      text: messageDto.text,
      timestamp: messageDto.timestamp
        ? new Date(messageDto.timestamp)
        : new Date(),
    });
    return convo.save();
  }

  /** حذف المحادثة */
  async remove(id: string): Promise<{ message: string }> {
    const convo = await this.findOne(id);
    await this.conversationModel.deleteOne({ _id: convo._id }).exec();
    return { message: 'Conversation deleted successfully' };
  }
}
