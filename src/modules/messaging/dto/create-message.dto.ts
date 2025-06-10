export class CreateMessageDto {
  merchantId: string;
  conversationId: string;
  channel: string;
  role: 'customer' | 'bot';
  text: string;
  metadata?: Record<string, any>;
}
