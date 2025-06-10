import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
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
  ApiBody,
  ApiParam,
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
  @ApiOperation({ summary: 'إنشاء محادثة جديدة بين تاجر وعميل' })
  @ApiBody({ type: CreateConversationDto })
  @ApiCreatedResponse({
    description: 'تم إنشاء المحادثة بنجاح',
    schema: {
      example: {
        _id: '6651...',
        merchantId: '663...',
        userId: '9665xxxxxxx',
        channel: 'whatsapp',
        createdAt: '2025-06-10T09:00:00Z',
        updatedAt: '2025-06-10T09:00:00Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'مدخلات غير صحيحة' })
  @ApiUnauthorizedResponse({ description: 'يجب تسجيل الدخول' })
  async create(
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const convo = await this.svc.create(dto);
    return this.toDto(convo);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'جلب جميع المحادثات المرتبطة بتاجر محدد' })
  @ApiParam({ name: 'merchantId', description: 'معرّف التاجر' })
  @ApiOkResponse({
    description: 'قائمة المحادثات',
    schema: {
      example: [
        {
          _id: '6651...',
          merchantId: '663...',
          userId: '9665xxxxxxx',
          channel: 'telegram',
          createdAt: '2025-06-10T09:00:00Z',
          updatedAt: '2025-06-10T09:10:00Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'لا توجد محادثات' })
  @ApiUnauthorizedResponse()
  async findAllByMerchant(
    @Param('merchantId') mId: string,
  ): Promise<ConversationResponseDto[]> {
    const convos = await this.svc.findAllByMerchant(mId);
    return convos.map((c) => this.toDto(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب محادثة معينة حسب معرّفها' })
  @ApiParam({ name: 'id', description: 'معرّف المحادثة' })
  @ApiOkResponse({
    description: 'تفاصيل المحادثة',
    schema: {
      example: {
        _id: '6651...',
        merchantId: '663...',
        userId: '9665xxxxxxx',
        channel: 'whatsapp',
        createdAt: '2025-06-10T09:00:00Z',
        updatedAt: '2025-06-10T09:05:00Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'المحادثة غير موجودة' })
  @ApiUnauthorizedResponse()
  async findOne(@Param('id') id: string): Promise<ConversationResponseDto> {
    const convo = await this.svc.findOne(id);
    return this.toDto(convo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف محادثة من قاعدة البيانات' })
  @ApiParam({ name: 'id', description: 'معرّف المحادثة' })
  @ApiOkResponse({ description: 'تم حذف المحادثة بنجاح' })
  @ApiNotFoundResponse({ description: 'المحادثة غير موجودة' })
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
