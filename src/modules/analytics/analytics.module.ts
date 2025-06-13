// src/modules/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MissingQueryService } from './missing-query.service';

import {
  MessageSession,
  MessageSessionSchema,
} from '../messaging/schemas/message.schema';
import {
  MissingQuery,
  MissingQuerySchema,
} from './schemas/missing-query.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageSession.name, schema: MessageSessionSchema },
      { name: MissingQuery.name, schema: MissingQuerySchema },
    ]),
  ],
  providers: [AnalyticsService, MissingQueryService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
