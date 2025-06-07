import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { GenerateReplyDto } from './dto/generate-reply.dto';

@ApiTags('المحادثات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء محادثة جديدة' })
  @ApiBody({
    type: CreateConversationDto,
    description: 'بيانات إنشاء المحادثة',
  })
  @ApiCreatedResponse({
    description: 'تم إنشاء المحادثة بنجاح',
    type: ConversationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح (بيانات مفقودة أو غير صحيحة)',
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح (توكن JWT غير صالح أو مفقود)',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const convo = await this.conversationsService.create(createDto);
    return this.toResponseDto(convo);
  }

  @Put(':id/message')
  @ApiParam({ name: 'id', description: 'معرّف المحادثة', type: String })
  @ApiOperation({ summary: 'إضافة رسالة إلى محادثة موجودة' })
  @ApiBody({ type: AddMessageDto, description: 'بيانات الرسالة الجديدة' })
  @ApiOkResponse({
    description: 'تمت إضافة الرسالة بنجاح',
    type: ConversationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'لم يتم العثور على المحادثة' })
  @ApiBadRequestResponse({ description: 'طلب غير صالح' })
  async addMessage(
    @Param('id') id: string,
    @Body() messageDto: AddMessageDto,
  ): Promise<ConversationResponseDto> {
    const convo = await this.conversationsService.addMessage(id, messageDto);
    return this.toResponseDto(convo);
  }

  @Get('merchant/:merchantId')
  @ApiParam({ name: 'merchantId', description: 'معرّف التاجر', type: String })
  @ApiOperation({ summary: 'جلب جميع المحادثات لتاجر محدد' })
  @ApiOkResponse({
    description: 'تم إرجاع قائمة المحادثات',
    type: ConversationResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود أو لا توجد محادثات' })
  async findAllByMerchant(
    @Param('merchantId') merchantId: string,
  ): Promise<ConversationResponseDto[]> {
    const convos =
      await this.conversationsService.findAllByMerchant(merchantId);
    return convos.map((c) => this.toResponseDto(c));
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'معرّف المحادثة', type: String })
  @ApiOperation({ summary: 'جلب محادثة واحدة حسب المعرف' })
  @ApiOkResponse({
    description: 'تم إرجاع تفاصيل المحادثة',
    type: ConversationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'لم يتم العثور على المحادثة' })
  async findOne(@Param('id') id: string): Promise<ConversationResponseDto> {
    const convo = await this.conversationsService.findOne(id);
    return this.toResponseDto(convo);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'معرّف المحادثة', type: String })
  @ApiOperation({ summary: 'حذف محادثة' })
  @ApiOkResponse({ description: 'تم حذف المحادثة بنجاح' })
  @ApiNotFoundResponse({ description: 'لم يتم العثور على المحادثة' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.conversationsService.remove(id);
  }

  @Post(':merchantId/reply')
  @ApiParam({ name: 'merchantId', description: 'معرّف التاجر', type: String })
  @ApiOperation({ summary: 'توليد رد للمستخدم بناءً على الرسالة المدخلة' })
  @ApiBody({
    schema: { example: { message: 'نص رسالة المستخدم' } },
    description: 'نص الرسالة لإنتاج الرد',
  })
  @ApiOkResponse({
    description: 'تم إنشاء الرد بنجاح',
    schema: { example: { reply: 'نص الرد المولّد' } },
  })
  @ApiBadRequestResponse({ description: 'طلب غير صالح' })
  async reply(
    @Param('merchantId') merchantId: string,
    @Body('message') message: string,
  ) {
    const dto = new GenerateReplyDto();
    dto.merchantId = merchantId;
    dto.userMessage = message;
    dto.history = [];

    const reply = await this.conversationsService.generateReply(dto);
    return { reply };
  }

  /** تحويل المستند إلى DTO للاستجابة */
  private toResponseDto(convo: any): ConversationResponseDto {
    return {
      _id: convo._id.toString(),
      merchantId: convo.merchantId.toString(),
      userId: convo.userId,
      messages: convo.messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
      })),
      createdAt: convo.createdAt,
      updatedAt: convo.updatedAt,
    };
  }
}

/**
 * النواقص:
 * - لم يتم توثيق استثناء 401 في نقطتي التعديل والحذف (يمكن إضافة @ApiUnauthorizedResponse).
 * - يُفضّل إضافة @ApiQuery لمرشحات البحث إن دعت الحاجة.
 * - توثيق GenerateReplyDto بشكل كامل ضمن @ApiBody للرد.
 * - تنسيق مثال الرد بشكل موحد لكل الطرق.
 */
