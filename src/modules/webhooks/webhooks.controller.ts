import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { HandleWebhookDto } from './dto/handle-webhook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':eventType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'eventType',
    type: 'string',
    description: 'نوع الحدث (مثال: product.updated)',
  })
  @ApiBody({
    type: HandleWebhookDto,
    description: 'بيانات الحدث الواردة من n8n أو المصدر الخارجي',
  })
  @ApiCreatedResponse({ description: 'تم استلام الحدث وحفظه بنجاح' })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح: تنسيق الحمولة خاطئ أو مفقود',
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  @HttpCode(HttpStatus.CREATED)
  async handleWebhook(
    @Param('eventType') eventType: string,
    @Body() handleDto: HandleWebhookDto,
  ) {
    return this.webhooksService.handleEvent(eventType, handleDto.payload || {});
  }

  @Post('whatsapp_incoming')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'استقبال رسائل الواتساب الواردة (API Key protected)',
  })
  @ApiBody({
    schema: {
      example: {
        merchantId: '123',
        from: '+123456789',
        messageText: 'نص الرسالة',
      },
    },
    description: 'بيانات رسالة الواتساب الواردة',
  })
  @ApiCreatedResponse({ description: 'تم استلام رسالة الواتساب وحفظها بنجاح' })
  @ApiBadRequestResponse({ description: 'طلب غير صالح: الحقول مطلوبة' })
  @HttpCode(HttpStatus.CREATED)
  async handleWhatsappWebhook(@Body() payload: any) {
    const { merchantId, from, messageText } = payload;
    if (!merchantId || !from || !messageText) {
      throw new BadRequestException(
        'الحقول merchantId وfrom وmessageText مطلوبة',
      );
    }
    return this.webhooksService.handleEvent('whatsapp_incoming', {
      merchantId,
      from,
      messageText,
    });
  }
}

/**
 * النواقص:
 * - إضافة @ApiNotFoundResponse إذا كانت النقطة تحتاج التحقق من وجود المورد.
 * - توثيق مفصل لهيكل HandleWebhookDto وحقول payload.
 * - يمكن إضافة أمثلة JSON أكثر في ApiCreatedResponse باستخدام schema.example.
 */
