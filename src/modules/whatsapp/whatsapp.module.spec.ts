import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappModule } from './whatsapp.module';

describe('WhatsappModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [WhatsappModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });
});
