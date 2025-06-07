// src/modules/conversations/conversations.controller.ts

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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ConversationResponseDto } from './dto/conversation-response.dto';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiCreatedResponse({
    description: 'Conversation created successfully.',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const convo = await this.conversationsService.create(createDto);
    return this.toResponseDto(convo);
  }

  @Put(':id/message')
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  @ApiOperation({ summary: 'Add a message to an existing conversation' })
  @ApiOkResponse({
    description: 'Message added successfully.',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async addMessage(
    @Param('id') id: string,
    @Body() messageDto: AddMessageDto,
  ): Promise<ConversationResponseDto> {
    const convo = await this.conversationsService.addMessage(id, messageDto);
    return this.toResponseDto(convo);
  }

  @Get('merchant/:merchantId')
  @ApiParam({ name: 'merchantId', description: 'Merchant ID', type: String })
  @ApiOperation({ summary: 'Get all conversations for a specific merchant' })
  @ApiOkResponse({
    description: 'List of conversations returned.',
    type: ConversationResponseDto,
    isArray: true,
  })
  async findAllByMerchant(
    @Param('merchantId') merchantId: string,
  ): Promise<ConversationResponseDto[]> {
    const convos =
      await this.conversationsService.findAllByMerchant(merchantId);
    return convos.map((c) => this.toResponseDto(c));
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  @ApiOperation({ summary: 'Get a single conversation by ID' })
  @ApiOkResponse({
    description: 'Conversation returned.',
    type: ConversationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async findOne(@Param('id') id: string): Promise<ConversationResponseDto> {
    const convo = await this.conversationsService.findOne(id);
    return this.toResponseDto(convo);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiOkResponse({ description: 'Conversation deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.conversationsService.remove(id);
  }

  /** تحويل ConversationDocument إلى ConversationResponseDto */
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
