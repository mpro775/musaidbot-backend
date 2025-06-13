// src/modules/llm/llm.module.ts
import { Module } from '@nestjs/common';
import { LlmProxyService } from './llm-proxy.service';

@Module({
  providers: [LlmProxyService],
  exports: [LlmProxyService],
})
export class LlmModule {}
