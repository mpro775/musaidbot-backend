import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { ConversationDocument } from './schemas/conversation.schema';

@ApiTags('المحادثات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly svc: ConversationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'إنشاء محادثة جديدة' })
  @ApiCreatedResponse({ type: ConversationResponseDto })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async create(
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const convo = await this.svc.create(dto);
    return this.toDto(convo);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'جلب محادثات التاجر' })
  @ApiOkResponse({ type: ConversationResponseDto, isArray: true })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  async findAllByMerchant(
    @Param('merchantId') mId: string,
  ): Promise<ConversationResponseDto[]> {
    const convos = await this.svc.findAllByMerchant(mId);
    return convos.map((c) => this.toDto(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب محادثة واحدة' })
  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  async findOne(@Param('id') id: string): Promise<ConversationResponseDto> {
    const convo = await this.svc.findOne(id);
    return this.toDto(convo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف محادثة' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  private toDto(c: ConversationDocument): ConversationResponseDto {
    return {
      _id: c._id.toString(),
      merchantId: c.merchantId.toString(),
      userId: c.userId,
      createdAt: c.createdAt.toISOString(), // ← هنا كذلك
      updatedAt: c.updatedAt.toISOString(), // ← وهنا
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
