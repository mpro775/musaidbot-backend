// src/modules/whatsapp/whatsapp.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

class WhatsappReplyDto {
  merchantId: string;
  from: string; // رقم العميل (مثلاً "+9677...)"
  messageText: string;
}

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @UseGuards(ApiKeyGuard)
  @Post('reply')
  async getReply(@Body() dto: WhatsappReplyDto) {
    const { merchantId, from, messageText } = dto;
    const replyText = await this.whatsappService.handleIncoming(
      merchantId,
      from,
      messageText,
    );
    return { replyText };
  }
}
