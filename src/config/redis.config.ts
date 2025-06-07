// src/config/redis.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';

@Injectable()
export class RedisConfig {
  public readonly connection: ConnectionOptions;

  constructor(private configService: ConfigService) {
    const redisPort = this.configService.get<string>('REDIS_PORT');

    this.connection = {
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: redisPort ? parseInt(redisPort, 10) : 6379,
    };
  }
}
