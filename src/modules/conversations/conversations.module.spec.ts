import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsModule } from './conversations.module';

describe('ConversationsModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConversationsModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });
});
