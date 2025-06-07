// src/modules/conversations/dto/generate-reply.dto.ts
export class GenerateReplyDto {
  merchantId: string;
  userMessage: string;
  history: string[];
  useTemplate?: boolean;
  templateId?: string;
  customerName?: string;
  orderId?: string;
}
