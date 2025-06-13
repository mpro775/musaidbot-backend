// src/modules/reminders/reminders.service.ts
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';
import { ProductsService } from '../products/products.service';
import { MerchantsService } from '../merchants/merchants.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly merchantsService: MerchantsService,
    private readonly telegramService: TelegramService,
  ) {}

  /** 1) سجل طلب التذكير */
  async subscribe(
    merchantId: string,
    sessionId: string,
    channel: string,
    productId: string,
  ) {
    const mId = new Types.ObjectId(merchantId);
    const pId = new Types.ObjectId(productId);
    await this.reminderModel.create({
      merchantId: mId,
      sessionId,
      channel,
      productId: pId,
    });
    this.logger.log(`Subscribed reminder for product ${productId}`);
  }

  /** 2) نفّذ تنبيهات لجميع التذكيرات غير المبلّغ عنها لهذا المنتج */
  async notifyIfAvailable(productId: string) {
    const pId = new Types.ObjectId(productId);
    const product = await this.productsService.findOne(productId);
    if (!product?.isAvailable) return;

    const reminders = await this.reminderModel
      .find({ productId: pId, isNotified: false })
      .lean();
    for (const r of reminders) {
      // جلب التوكن
      const merchant = await this.merchantsService.findOne(
        r.merchantId.toString(),
      );
      const token = merchant.channelConfig?.telegram?.token;
      if (r.channel === 'telegram' && token) {
        await this.telegramService.sendMessage(
          token,
          r.sessionId,
          `📣 المنتج "${product.name}" متوفر الآن! يمكنك الشراء من: ${product.originalUrl}`,
        );
      }
      // علّم التنبيه كمبلّغ عنه
      await this.reminderModel
        .updateOne({ _id: r._id }, { isNotified: true })
        .exec();
    }
  }
}
