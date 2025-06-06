import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    private conversationModel: Model<ConversationDocument>,
  ) {}

  // إنشاء محادثة جديدة
  async create(createDto: CreateConversationDto): Promise<Conversation> {
    const convo = new this.conversationModel({
      merchantId: createDto.merchantId,
      userId: createDto.userId,
      messages: createDto.messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp ? msg.timestamp : new Date(),
      })),
    });
    return await convo.save();
  }

  // إضافة رسالة جديدة إلى محادثة قائمة (حسب ID المحادثة)
  async addMessage(
    convoId: string,
    messageDto: AddMessageDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(convoId).exec();
    if (!conversation) throw new NotFoundException('Conversation not found');

    conversation.messages.push({
      sender: messageDto.sender,
      text: messageDto.text,
      timestamp: new Date(),
    });
    return await conversation.save();
  }

  // جلب جميع المحادثات الخاصة بالتاجر (merchantId)
  async findAllByMerchant(merchantId: string): Promise<Conversation[]> {
    return await this.conversationModel.find({ merchantId }).exec();
  }

  // جلب محادثة واحدة حسب ID
  async findOne(convoId: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(convoId).exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  // حذف/أرشفة محادثة (هنا نحذفها ببساطة)
  async remove(convoId: string): Promise<{ message: string }> {
    const convo = await this.conversationModel
      .findByIdAndDelete(convoId)
      .exec();
    if (!convo) throw new NotFoundException('Conversation not found');
    return { message: 'Conversation deleted successfully' };
  }
}
