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

  async update(id: string, dto: UpdateResponseDto) {
    const updated = await this.responseModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Response not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.responseModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Response not found');
    return { message: 'Deleted successfully' };
  }
}
