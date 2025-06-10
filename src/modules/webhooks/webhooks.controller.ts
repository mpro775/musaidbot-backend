import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { HandleWebhookDto } from './dto/handle-webhook.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':eventType')
  @ApiOperation({
    summary: 'Handle generic webhook events (e.g., incoming messages).',
  })
  @ApiParam({
    name: 'eventType',
    type: String,
    description:
      'نوع الحدث (مثل whatsapp_incoming, telegram_incoming, product.updated).',
  })
  @ApiBody({
    type: HandleWebhookDto,
    description: 'Payload for the webhook event.',
  })
  @ApiCreatedResponse({ description: 'تم معالجة الحدث بنجاح وارجاع نص الرد.' })
  @ApiBadRequestResponse({ description: 'الحمولة غير صحيحة أو ناقصة.' })
  @HttpCode(HttpStatus.CREATED)
  async handleWebhook(
    @Param('eventType') eventType: string,
    @Body() dto: HandleWebhookDto,
  ) {
    const { merchantId, from, messageText, metadata } = dto.payload || {};
    if (!merchantId || !from || !messageText) {
      throw new BadRequestException(
        'الحقول merchantId وfrom وmessageText مطلوبة.',
      );
    }

    return this.webhooksService.handleEvent(eventType, {
      merchantId,
      from,
      messageText,
      metadata,
    });
  }
}
