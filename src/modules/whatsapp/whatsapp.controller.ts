import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

class WhatsappReplyDto {
  merchantId: string;
  from: string; // رقم العميل (مثال: "+9677...")
  messageText: string;
}

@ApiTags('الواتساب')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('reply')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'توليد رد على رسالة الواتساب الواردة (محمي بمفتاح API)',
  })
  @ApiBody({
    type: WhatsappReplyDto,
    description: 'بيانات رسالة الواتساب الواردة',
  })
  @ApiCreatedResponse({
    description: 'تم إنشاء الرد بنجاح',
    schema: { example: { replyText: 'نص الرد المولد' } },
  })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح: بيانات ناقصة أو تنسيق خاطئ',
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: مفتاح API غير صالح أو مفقود',
  })
  @HttpCode(HttpStatus.CREATED)
  async getReply(@Body() dto: WhatsappReplyDto) {
    const { merchantId, from, messageText } = dto;
    if (!merchantId || !from || !messageText) {
      throw new BadRequestException(
        'الحقول merchantId وfrom وmessageText مطلوبة',
      );
    }
    const replyText = await this.whatsappService.handleIncoming(
      merchantId,
      from,
      messageText,
    );
    return { replyText };
  }
}

/**
 * النواقص:
 * - إضافة @ApiUnauthorizedResponse أو @ApiForbiddenResponse لحالات صلاحيات إضافية.
 * - توثيق هيكل WhatsappReplyDto بشكل مفصل (مثال لطول الرقم ونمط النص).
 * - يمكن إضافة ApiInternalServerErrorResponse للتعامل مع أخطاء الخدمة.
 */
