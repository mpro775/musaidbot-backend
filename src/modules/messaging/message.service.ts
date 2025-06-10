// src/modules/messaging/message.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    const created = new this.messageModel(dto);
    return created.save();
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.messageModel.find({ conversationId }).exec();
  }
  // في MessageService
  async findById(id: string): Promise<MessageDocument> {
    const doc = await this.messageModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }
    return doc;
  }
  async update(id: string, dto: UpdateMessageDto): Promise<MessageDocument> {
    const updated = await this.messageModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.messageModel.deleteOne({ _id: id }).exec();
    return { deleted: res.deletedCount > 0 };
  }

  async findAll(filters: {
    merchantId?: string;
    channel?: string;
    role?: 'customer' | 'bot';
    limit: number;
    page: number;
  }): Promise<{ data: Message[]; total: number }> {
    const query: any = {};
    if (filters.merchantId) query.merchantId = filters.merchantId;
    if (filters.channel) query.channel = filters.channel;
    if (filters.role) query.role = filters.role;

    const total = await this.messageModel.countDocuments(query);
    const data = await this.messageModel
      .find(query)
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .exec();

    return { data, total };
  }

  // Add other helpers as needed
}
