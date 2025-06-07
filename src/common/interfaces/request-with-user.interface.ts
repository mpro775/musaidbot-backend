import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    role: string;
    [key: string]: any;
    merchantId?: string; // ✅ لتسهيل الوصول لاحقًا
  };
}
