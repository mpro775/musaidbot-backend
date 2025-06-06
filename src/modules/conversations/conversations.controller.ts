import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * @api {post} /conversations إنشاء محادثة جديدة
   * @apiName CreateConversation
   * @apiGroup Conversations
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiParam {String} merchantId معرّف التاجر.
   * @apiParam {String} userId معرّف المستخدم.
   * @apiParam {Object[]} messages قائمة الرسائل الأولى.
   * @apiParam {String} messages.sender مرسل الرسالة ('merchant' أو 'user').
   * @apiParam {String} messages.text نص الرسالة.
   * @apiParam {Date} [messages.timestamp] وقت الرسالة (اختياري).
   *
   * @apiSuccess {Object} conversation كائن المحادثة المنشأة.
   *
   * @apiError (400) BadRequest خطأ في حقول الإدخال.
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateConversationDto) {
    return this.conversationsService.create(createDto);
  }

  /**
   * @api {put} /conversations/:id/message إضافة رسالة إلى محادثة قائمة
   * @apiName AddMessage
   * @apiGroup Conversations
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المحادثة.
   * @apiParam {String} sender مرسل الرسالة ('merchant' أو 'user').
   * @apiParam {String} text نص الرسالة.
   *
   * @apiSuccess {Object} conversation كائن المحادثة بعد إضافة الرسالة.
   *
   * @apiError (400) BadRequest خطأ في حقول الإدخال.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   * @apiError (404) NotFound المحادثة غير موجودة.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Conversation ID',
  })
  @ApiOperation({ summary: 'Add a message to an existing conversation' })
  @ApiResponse({
    status: 200,
    description: 'Message added successfully.',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @UseGuards(JwtAuthGuard)
  @Put(':id/message')
  async addMessage(@Param('id') id: string, @Body() messageDto: AddMessageDto) {
    return this.conversationsService.addMessage(id, messageDto);
  }

  /**
   * @api {get} /conversations/merchant/:merchantId جلب كل محادثات تاجر
   * @apiName GetAllByMerchant
   * @apiGroup Conversations
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} merchantId معرّف التاجر.
   *
   * @apiSuccess {Object[]} conversations قائمة المحادثات الخاصة بالتاجر.
   *
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'merchantId',
    type: 'string',
    description: 'Merchant ID',
  })
  @ApiOperation({ summary: 'Get all conversations for a specific merchant' })
  @ApiResponse({
    status: 200,
    description: 'List of conversations returned.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('merchant/:merchantId')
  async findAllByMerchant(@Param('merchantId') merchantId: string) {
    return this.conversationsService.findAllByMerchant(merchantId);
  }

  /**
   * @api {get} /conversations/:id جلب محادثة واحدة حسب معرّف
   * @apiName GetOneConversation
   * @apiGroup Conversations
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المحادثة.
   *
   * @apiSuccess {Object} conversation كائن المحادثة.
   *
   * @apiError (404) NotFound المحادثة غير موجودة.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Conversation ID',
  })
  @ApiOperation({ summary: 'Get a single conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation returned.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  /**
   * @api {delete} /conversations/:id حذف محادثة
   * @apiName DeleteConversation
   * @apiGroup Conversations
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المحادثة.
   *
   * @apiSuccess {String} message رسالة نجاح الحذف.
   *
   * @apiError (404) NotFound المحادثة غير موجودة.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Conversation ID',
  })
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }
}
