import { Test, TestingModule } from '@nestjs/testing';
import { ResponseModule } from './response.module';

describe('ResponseModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ResponseModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });
});
