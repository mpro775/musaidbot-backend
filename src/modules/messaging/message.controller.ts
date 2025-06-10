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

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto);
  }

  @Get('conversation/:conversationId')
  async findByConversation(@Param('conversationId') conversationId: string) {
    return this.messageService.findByConversation(conversationId);
  }
  // في MessageController
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.messageService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    return this.messageService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }

  @Get()
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
