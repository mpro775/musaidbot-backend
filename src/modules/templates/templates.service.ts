import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from '../merchants/dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
  ) {}

  /**
   * إنشاء قالب جديد لتاجر معين
   * @param merchantId معرف التاجر
   * @param dto بيانات القالب (name, body)
   */
  async create(
    merchantId: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateDocument> {
    const template = new this.templateModel({
      merchantId: new Types.ObjectId(merchantId),
      name: dto.name,
      body: dto.body,
    });
    return template.save();
  }

  /**
   * جلب جميع القوالب الخاصة بتاجر
   * @param merchantId معرف التاجر
   */
  async findAll(merchantId: string): Promise<TemplateDocument[]> {
    return this.templateModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .exec();
  }

  /**
   * تحديث قالب بالقيم الجديدة
   * @param templateId معرف القالب
   * @param dto بيانات التحديث (name, body)
   */
  async update(
    templateId: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateDocument> {
    const updated = await this.templateModel
      .findByIdAndUpdate(
        templateId,
        { name: dto.name, body: dto.body },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Template not found');
    }
    return updated;
  }

  async findById(templateId: string): Promise<TemplateDocument> {
    const tpl = await this.templateModel.findById(templateId).exec();
    if (!tpl) throw new NotFoundException('Template not found');
    return tpl;
  }
  /**
   * حذف قالب
   * @param templateId معرف القالب
   */
  async remove(templateId: string): Promise<{ message: string }> {
    const result = await this.templateModel
      .deleteOne({ _id: new Types.ObjectId(templateId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Template not found');
    }
    return { message: 'Template deleted successfully' };
  }
}
