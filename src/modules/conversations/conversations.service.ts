import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { lastValueFrom } from 'rxjs';
import {
  Template,
  TemplateDocument,
} from '../templates/schemas/template.schema';
import { GenerateReplyDto } from './dto/generate-reply.dto';

@Injectable()
export class ConversationsService {
  private openaiWebhookUrl: string;

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    // بدل قراءة المتغيّر والتأكيد عليه برمي خطأ:
    // const url = this.config.get<string>('n8n.openaiWebhookUrl');
    // if (!url) {
    //   throw new Error('N8N_OPENAI_WEBHOOK_URL is not defined in .env');
    // }
    // this.openaiWebhookUrl = url;

    // عوضًا عن ذلك:
    this.openaiWebhookUrl =
      this.config.get<string>('n8n.openaiWebhookUrl') || '';
    // أو يمكنك تعيين ثابت مؤقت:
    // this.openaiWebhookUrl = 'http://localhost:5678/webhook/openai';
  }

  async create(dto: CreateConversationDto): Promise<ConversationDocument> {
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
  async ensureConversation(
    merchantId: string,
    userId: string,
  ): Promise<ConversationDocument> {
    // 1) حاول إيجاد المحادثة الموجودة
    let convo = (await this.conversationModel
      .findOne({ merchantId: new Types.ObjectId(merchantId), userId })
      .exec()) as ConversationDocument | null;

    // 2) إذا لم توجد، أنشئ واحدة جديدة
    if (!convo) {
      const dto: CreateConversationDto = {
        merchantId,
        userId,
        channel: 'whatsapp',
        messages: [], // ابدأ بلا رسائل
      };
      convo = await this.create(dto);
    }
    // convo الآن ConversationDocument مضمونة
    return convo;
  }
  async generateReply(dto: GenerateReplyDto): Promise<string> {
    // جلب إعدادات التاجر من الموديل الصحيح
    const {
      merchantId,
      userMessage,
      history,
      useTemplate,
      templateId,
      customerName,
      orderId,
    } = dto;

    const merchantModel = this.conversationModel.db.model('Merchant');
    const merchant = await merchantModel.findById(merchantId).exec();
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (useTemplate && templateId) {
      const tpl = await this.templateModel.findById(templateId).exec();
      if (!tpl) throw new NotFoundException('Template not found');
      return tpl.body
        .replace('{{1}}', customerName || '')
        .replace('{{2}}', orderId || '');
    }

    const cfg = merchant.promptConfig;
    const prompt = `
أنت بوت دعم فني لتاجر "${merchant.name}" في مجال ${merchant.industry}.
لهجتك ${cfg.dialect} ونبرة الحديث ${cfg.tone}.
${cfg.template}

سياق المحادثة:
${history.join('\n')}

رسالة العميل: "${userMessage}"

أجب بطريقة موجزة وودّية:
    `.trim();

    // استدعاء n8n عبر lastValueFrom لتجنّب تسرب any
    const axiosResponse = await lastValueFrom(
      this.http.post<{ reply: string }>(this.openaiWebhookUrl, { prompt }),
    );
    const reply: string = axiosResponse.data.reply;
    return reply;
  }
  /** جلب جميع المحادثات لتاجر */
  async findAllByMerchant(merchantId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .exec();
  }

  /** جلب محادثة واحدة بالـ ID */
  async findOne(id: string): Promise<ConversationDocument> {
    const convo = await this.conversationModel.findById(id).exec();
    if (!convo) throw new NotFoundException('Conversation not found');
    return convo;
  }

  /** إضافة رسالة وإرجاع المحادثة بعد التحديث */
  async addMessage(
    convoId: string,
    messageDto: AddMessageDto,
  ): Promise<ConversationDocument> {
    const convo = await this.findOne(convoId);
    convo.messages.push({
      sender: messageDto.sender,
      text: messageDto.text,
      timestamp: messageDto.timestamp
        ? new Date(messageDto.timestamp)
        : new Date(),
      channel: messageDto.channel ?? convo.channel, // استخدم القناة الافتراضية أو القادمة
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
