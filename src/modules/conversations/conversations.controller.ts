import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // إنشاء محادثة جديدة
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateConversationDto) {
    return this.conversationsService.create(createDto);
  }

  // إضافة رسالة إلى محادثة موجودة
  @UseGuards(JwtAuthGuard)
  @Put(':id/message')
  async addMessage(@Param('id') id: string, @Body() messageDto: AddMessageDto) {
    return this.conversationsService.addMessage(id, messageDto);
  }

  // جلب كل المحادثات لتاجر معيّن (merchantId يمكن أيضًا أخذه من التوكن)
  @UseGuards(JwtAuthGuard)
  @Get('merchant/:merchantId')
  async findAllByMerchant(@Param('merchantId') merchantId: string) {
    return this.conversationsService.findAllByMerchant(merchantId);
  }

  // جلب محادثة واحدة حسب ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  // حذف المحادثة
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }
}
