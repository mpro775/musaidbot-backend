import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { HandleWebhookDto } from './dto/handle-webhook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * @api {post} /webhook/:eventType استقبال أحداث Webhook من n8n
   * @apiName HandleWebhook
   * @apiGroup Webhooks
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} eventType نوع الحدث (مثال: product.updated).
   * @apiParam {Object} [payload] الحمولة (اختياري، يمكن أن تحتوي على نصائح إضافية).
   *
   * @apiSuccess {Object} webhook كائن الحدث المحفوظ في قاعدة البيانات.
   *
   * @apiError (400) BadRequest خطأ في تنسيق الحمولة.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'eventType',
    type: 'string',
    description: 'Event type (e.g., "product.updated")',
  })
  @ApiOperation({ summary: 'Handle incoming webhook event (protected)' })
  @ApiResponse({
    status: 201,
    description: 'Webhook event handled and saved.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post(':eventType')
  async handleWebhook(
    @Param('eventType') eventType: string,
    @Body() handleDto: HandleWebhookDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Request() req: RequestWithUser,
  ) {
    // تحويل الحمولة إلى كائن موحّد أو التحقق من صلاحيات إضافية إذا أردت
    return this.webhooksService.handleEvent(eventType, handleDto.payload || {});
  }
}
