// src/modules/telegram/telegram.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async sendMessage(
    token: string,
    chatId: string | number,
    text: string,
    options?: {
      parseMode?: 'Markdown' | 'HTML';
      replyToMessageId?: number;
      disableWebPagePreview?: boolean;
    },
  ): Promise<void> {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
      await axios.post(url, {
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode || 'Markdown',
        reply_to_message_id: options?.replyToMessageId,
        disable_web_page_preview: options?.disableWebPagePreview,
      });
      this.logger.log(
        `Sent message to Telegram chatId=${chatId} [${text.slice(0, 60)}...]`,
      );
    } catch (error) {
      this.logger.error('Telegram API error', error?.response?.data || error);
      // لا ترفع الاستثناء إلا إذا أردت إيقاف الخدمة عند الخطأ
    }
  }
}
