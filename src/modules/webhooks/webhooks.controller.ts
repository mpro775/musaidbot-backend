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

@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // نقطة النهاية التي يستدعيها n8n عند حدث معين
  // مثال: POST /api/webhook/product.updated
  @UseGuards(JwtAuthGuard)
  @Post(':eventType')
  async handleWebhook(
    @Param('eventType') eventType: string,
    @Body() handleDto: HandleWebhookDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Request() req: RequestWithUser,
  ) {
    // يمكن التحقق من صلاحيات المستخدم عبر التوكن إن أردت
    return this.webhooksService.handleEvent(eventType, handleDto.payload || {});
  }
}
