import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema';
import { WebhookPayload } from 'src/common/interfaces/webhook-payload.interface';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
  ) {}

  async handleEvent(
    eventType: string,
    payload: WebhookPayload,
  ): Promise<Webhook> {
    const webhook = new this.webhookModel({ eventType, payload });
    await webhook.save();
    return webhook;
  }
  async findAll(): Promise<Webhook[]> {
    return await this.webhookModel.find().exec();
  }
}
