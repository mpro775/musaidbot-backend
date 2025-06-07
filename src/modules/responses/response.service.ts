// src/modules/responses/response.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

import { Response, ResponseDocument } from './schemas/response.schema';

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
  ) {}

  async findAll(merchantId: string) {
    return this.responseModel.find({ merchantId }).exec();
  }

  async create(merchantId: string, dto: CreateResponseDto) {
    // التحقّق من عدم وجود كلمة مفتاحية مكررة
    const exists = await this.responseModel.findOne({
      merchantId: new Types.ObjectId(merchantId),
      keyword: dto.keyword,
    });
    if (exists) throw new BadRequestException('Keyword already exists');

    const created = await this.responseModel.create({
      merchantId: new Types.ObjectId(merchantId),
      keyword: dto.keyword,
      replyText: dto.replyText,
    });
    return created;
  }

  async update(id: string, dto: UpdateResponseDto, merchantId: string) {
    const response = await this.responseModel.findById(id);
    if (!response) throw new NotFoundException('Response not found');

    // ✅ تحقق من الملكية
    if (response.merchantId.toString() !== merchantId) {
      throw new BadRequestException(
        'You are not allowed to modify this response',
      );
    }

    response.keyword = dto.keyword ?? response.keyword;
    response.replyText = dto.replyText ?? response.replyText;
    return await response.save();
  }

  async remove(id: string, merchantId: string) {
    const response = await this.responseModel.findById(id);
    if (!response) throw new NotFoundException('Response not found');

    // ✅ تحقق من الملكية
    if (response.merchantId.toString() !== merchantId) {
      throw new BadRequestException(
        'You are not allowed to delete this response',
      );
    }

    await response.deleteOne();
    return { message: 'Deleted successfully' };
  }
}
