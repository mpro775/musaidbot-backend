// src/modules/messaging/message.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء رسالة جديدة داخل محادثة' })
  @ApiBody({ type: CreateMessageDto })
  @ApiCreatedResponse({
    description: 'تم إنشاء الرسالة بنجاح',
    schema: {
      example: {
        _id: '6651abc...',
        conversationId: '664...',
        merchantId: '663...',
        role: 'bot',
        text: 'مرحبًا بك! كيف يمكنني مساعدتك؟',
        channel: 'telegram',
        metadata: {},
        createdAt: '2025-06-10T08:30:00Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'البيانات غير صحيحة أو ناقصة' })
  create(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'جلب كل الرسائل المرتبطة بمحادثة معينة' })
  @ApiParam({ name: 'conversationId', description: 'معرّف المحادثة' })
  @ApiOkResponse({
    description: 'قائمة الرسائل',
    schema: {
      example: [
        {
          _id: '1',
          role: 'customer',
          text: 'السلام عليكم',
          channel: 'whatsapp',
          createdAt: '2025-06-10T08:30:00Z',
        },
        {
          _id: '2',
          role: 'bot',
          text: 'وعليكم السلام! كيف أقدر أساعدك؟',
          channel: 'whatsapp',
          createdAt: '2025-06-10T08:31:00Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'المحادثة غير موجودة أو لا تحتوي على رسائل',
  })
  findByConversation(@Param('conversationId') conversationId: string) {
    return this.messageService.findByConversation(conversationId);
  }

  // في MessageController
  @Get(':id')
  @ApiOperation({ summary: 'جلب رسالة مفردة حسب المعرّف' })
  @ApiParam({ name: 'id', description: 'معرّف الرسالة' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'الرسالة غير موجودة' })
  findOne(@Param('id') id: string) {
    return this.messageService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل نص أو بيانات رسالة موجودة' })
  @ApiParam({ name: 'id', description: 'معرّف الرسالة' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiOkResponse({ description: 'تم تعديل الرسالة' })
  @ApiNotFoundResponse({ description: 'الرسالة غير موجودة' })
  async update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    return this.messageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف رسالة من قاعدة البيانات' })
  @ApiParam({ name: 'id', description: 'معرّف الرسالة' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiNotFoundResponse({ description: 'الرسالة غير موجودة' })
  async remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }

  @Get()
  @ApiOperation({ summary: 'جلب الرسائل مع فلترة حسب التاجر، القناة، الدور' })
  @ApiOkResponse({
    description: 'نتائج الرسائل مع عدد الإجمالي',
    schema: {
      example: {
        total: 2,
        data: [
          {
            _id: '1',
            merchantId: '663...',
            text: 'مرحبًا!',
            role: 'bot',
            channel: 'telegram',
          },
          {
            _id: '2',
            merchantId: '663...',
            text: 'هل لديكم شحن دولي؟',
            role: 'customer',
            channel: 'telegram',
          },
        ],
      },
    },
  })
  @ApiQuery({ name: 'merchantId', required: false })
  @ApiQuery({
    name: 'channel',
    required: false,
    enum: ['whatsapp', 'telegram'],
  })
  @ApiQuery({ name: 'role', required: false, enum: ['customer', 'bot'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async findAll(
    @Query('merchantId') merchantId?: string,
    @Query('channel') channel?: string,
    @Query('role') role?: 'customer' | 'bot',
    @Query('limit') limit = '20',
    @Query('page') page = '1',
  ) {
    return this.messageService.findAll({
      merchantId,
      channel,
      role,
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
    });
  }
}
