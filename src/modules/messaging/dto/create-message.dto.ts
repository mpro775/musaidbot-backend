// MessageContentDto
export class MessageContentDto {
  role: 'customer' | 'bot' | 'ai'; // أضف ai هنا
  text: string;
  metadata?: Record<string, any>;
  timestamp?: Date; // أضفها اختيارية
}

// CreateMessageDto
export class CreateMessageDto {
  merchantId: string;
  sessionId: string;
  channel: string;
  messages: MessageContentDto[];
}
